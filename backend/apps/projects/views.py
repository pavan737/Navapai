from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import Project, ProjectScreenshot
from .serializers import (
    ProjectListSerializer,
    ProjectDetailSerializer,
    ProjectCreateUpdateSerializer,
    ProjectScreenshotSerializer,
)
from .services import GitHubSyncService


class PublicShowcaseProjectsListView(generics.ListAPIView):
    """
    Public API returning promoted community showcase projects (Section 33).
    """
    serializer_class = ProjectListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Project.objects.filter(
            visibility=Project.Visibility.PUBLIC,
        ).select_related("user", "community_domain", "user_domain")

        domain_slug = self.request.query_params.get("domain")
        if domain_slug:
            queryset = queryset.filter(
                Q(community_domain__slug=domain_slug) | Q(user_domain__original_name__iexact=domain_slug)
            )

        tag = self.request.query_params.get("technology")
        if tag:
            queryset = queryset.filter(technologies__contains=[tag])

        search = self.request.query_params.get("search")
        if search:
            q = search.strip()
            queryset = queryset.filter(
                Q(title__icontains=q)
                | Q(tagline__icontains=q)
                | Q(description__icontains=q)
                | Q(primary_language__icontains=q)
            )

        return queryset.order_by("-is_showcase", "-is_featured", "-github_stars_count", "-updated_at")


class PublicProjectsDirectoryListView(generics.ListAPIView):
    """
    Public searchable directory of developer portfolio projects.
    """
    serializer_class = ProjectListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Project.objects.filter(
            visibility=Project.Visibility.PUBLIC,
        ).select_related("user", "community_domain").order_by("-updated_at")


class MyProjectsListCreateView(generics.ListCreateAPIView):
    """
    List or create personal developer portfolio projects for the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ProjectCreateUpdateSerializer
        return ProjectListSerializer

    def get_queryset(self):
        queryset = Project.objects.filter(user=self.request.user).select_related("community_domain", "user_domain")
        domain_id = self.request.query_params.get("user_domain")
        if domain_id:
            queryset = queryset.filter(user_domain_id=domain_id)
        return queryset


class MyProjectDetailUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a specific project owned by request.user.
    """
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return ProjectCreateUpdateSerializer
        return ProjectDetailSerializer

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user).select_related("community_domain", "user_domain").prefetch_related("screenshots")


class SyncProjectGitHubView(APIView):
    """
    Manually triggers a fresh GitHub repository metadata sync for a project.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        project = get_object_or_404(Project, id=pk, user=request.user)
        if not project.github_url:
            return Response(
                {"error": "Project does not have a linked GitHub repository URL."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        synced_project = GitHubSyncService.sync_project(project)
        serializer = ProjectDetailSerializer(synced_project)
        return Response({
            "message": f"Successfully synchronized with GitHub ({synced_project.github_stars_count} stars).",
            "project": serializer.data,
        }, status=status.HTTP_200_OK)


class GitHubPreviewMetadataView(APIView):
    """
    Previews repository metadata given a GitHub URL without creating a project.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        url = request.data.get("github_url", "")
        owner, repo = GitHubSyncService.parse_github_url(url)
        if not owner or not repo:
            return Response(
                {"error": "Invalid GitHub repository URL format. Use https://github.com/owner/repo or owner/repo."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        metadata = GitHubSyncService.fetch_repo_metadata(owner, repo)
        return Response(metadata, status=status.HTTP_200_OK)


class GitHubUserReposView(APIView):
    """
    Fetches all public GitHub repositories for a given GitHub username or current user's profile.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        username = request.query_params.get("username")
        if not username and hasattr(request.user, "profile"):
            username = getattr(request.user.profile, "github_username", None)
        if not username:
            username = request.user.username

        repos = GitHubSyncService.fetch_user_repositories(username)
        return Response({
            "username": username,
            "count": len(repos),
            "repositories": repos,
        }, status=status.HTTP_200_OK)


class PublicDeveloperPortfolioView(APIView):
    """
    Returns public developer portfolio data including bio, verified skills, domain enrollments, and public projects.
    """
    permission_classes = [AllowAny]

    def get(self, request, username, *args, **kwargs):
        from apps.accounts.models import User
        from apps.domains.models import UserDomain

        from django.db.models import Q
        user = User.objects.filter(
            Q(username__iexact=username) | Q(profile__portfolio_slug__iexact=username)
        ).first()

        if not user:
            return Response({"detail": "Developer portfolio not found."}, status=status.HTTP_404_NOT_FOUND)

        # Profile data
        profile = getattr(user, "profile", None)
        bio = getattr(profile, "bio", "") if profile else ""
        location = getattr(profile, "location", "") if profile else ""
        skills = getattr(profile, "skills", []) if profile else []
        github_username = getattr(profile, "github_username", "") if profile else ""
        linkedin_url = getattr(profile, "linkedin_url", "") if profile else ""
        website_url = getattr(profile, "website_url", "") if profile else ""

        portfolio_slug = getattr(profile, "portfolio_slug", "") if profile else ""
        theme_color = getattr(profile, "theme_color", "#0082FF") if profile else "#0082FF"
        custom_headline = getattr(profile, "custom_headline", "") if profile else ""
        show_heatmap = getattr(profile, "show_heatmap", True) if profile else True
        show_certifications = getattr(profile, "show_certifications", True) if profile else True
        show_badges = getattr(profile, "show_badges", True) if profile else True

        # User projects
        projects_qs = Project.objects.filter(
            user=user,
            visibility=Project.Visibility.PUBLIC,
        ).select_related("community_domain").prefetch_related("screenshots").order_by("-is_featured", "-github_stars_count", "-updated_at")

        projects_data = ProjectListSerializer(projects_qs, many=True).data

        # User enrolled domains
        domains_qs = UserDomain.objects.filter(user=user).select_related("community_domain")
        domains_data = [{
            "id": ud.id,
            "original_name": ud.original_name,
            "community_domain_title": ud.community_domain.title if ud.community_domain else None,
            "community_domain_slug": ud.community_domain.slug if ud.community_domain else None,
            "status": ud.status,
            "progress_percent": ud.progress,
        } for ud in domains_qs]


        # Certifications and Milestones
        from apps.career.models import Certification, CareerMilestone
        from apps.career.serializers import CertificationSerializer, CareerMilestoneSerializer
        from apps.gamification.models import UserAchievement
        from apps.gamification.serializers import UserAchievementSerializer
        from apps.gamification.services import GamificationService

        certs_data = CertificationSerializer(Certification.objects.filter(user=user), many=True).data
        milestones_data = CareerMilestoneSerializer(CareerMilestone.objects.filter(user=user), many=True).data

        total_xp = GamificationService.calculate_user_xp(user)
        level_info = GamificationService.get_developer_level_info(total_xp)

        achievements_qs = UserAchievement.objects.filter(user=user).select_related("badge")
        achievements_data = UserAchievementSerializer(achievements_qs, many=True).data

        return Response({
            "developer": {
                "id": user.id,
                "username": user.username,
                "full_name": user.get_full_name() or user.username,
                "bio": bio,
                "location": location,
                "skills": skills,
                "github_username": github_username,
                "linkedin_url": linkedin_url,
                "website_url": website_url,
                "role": user.role,
                "date_joined": user.date_joined,
            },
            "portfolio_settings": {
                "portfolio_slug": portfolio_slug,
                "theme_color": theme_color,
                "custom_headline": custom_headline,
                "show_heatmap": show_heatmap,
                "show_certifications": show_certifications,
                "show_badges": show_badges,
            },
            "enrolled_domains": domains_data,
            "projects": projects_data,
            "certifications": certs_data if show_certifications else [],
            "career_milestones": milestones_data,
            "level_info": level_info,
            "achievements": achievements_data if show_badges else [],
            "total_stars": sum(p.get("github_stars_count", 0) for p in projects_data),
        }, status=status.HTTP_200_OK)




class ProjectScreenshotListCreateView(generics.ListCreateAPIView):
    """
    List or create screenshots for a specific project owned by request.user.
    """
    serializer_class = ProjectScreenshotSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs.get("project_id")
        return ProjectScreenshot.objects.filter(project_id=project_id, project__user=self.request.user)

    def perform_create(self, serializer):
        project = get_object_or_404(Project, id=self.kwargs.get("project_id"), user=self.request.user)
        serializer.save(project=project)

