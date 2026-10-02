from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from django.db.models import Q, F
from django.shortcuts import get_object_or_404
from .models import (
    CommunityDomain,
    DomainAlias,
    CurriculumTopic,
    TopicMilestone,
    UserDomain,
    LearningPlan,
    LearningPlanTopic,
    DomainMergeLog,
    AdminAuditLog,
)
from .serializers import (
    CommunityDomainListSerializer,
    CommunityDomainDetailSerializer,
    CurriculumTopicSerializer,
    UserDomainSerializer,
    UserDomainCreateSerializer,
    LearningPlanSerializer,
    LearningPlanCreateSerializer,
    LearningPlanTopicSerializer,
    DomainMergeLogSerializer,
    AdminAuditLogSerializer,
)
from .services import DomainSimilarityService, DomainMergeService


# ==========================================
# PUBLIC DOMAIN CATALOG ENDPOINTS
# ==========================================

class PublicDomainListView(generics.ListAPIView):
    """
    Public listing of approved learning domains with search and category filtering.
    """
    serializer_class = CommunityDomainListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):

        queryset = CommunityDomain.objects.filter(
            is_approved=True,
            is_public=True,
            status=CommunityDomain.Status.APPROVED,
        ).prefetch_related("aliases")


        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category__iexact=category)

        featured = self.request.query_params.get("featured")
        if featured and featured.lower() in ("true", "1"):
            queryset = queryset.filter(is_featured=True)

        search_query = self.request.query_params.get("search")
        if search_query:
            q = search_query.strip()
            queryset = queryset.filter(
                Q(title__icontains=q)
                | Q(description__icontains=q)
                | Q(category__icontains=q)
                | Q(aliases__alias__icontains=q)
            ).distinct()

        return queryset


class PublicDomainDetailView(generics.RetrieveAPIView):
    """
    Public domain detail endpoint retrieved by slug with nested canonical topics.
    """
    serializer_class = CommunityDomainDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        return CommunityDomain.objects.filter(
            is_approved=True,
            is_public=True,
        ).prefetch_related("aliases", "subdomains", "topics__milestones")


class DomainCurriculumTopicsListView(generics.ListAPIView):
    """
    Public list of canonical curriculum topics for a specific domain.
    """
    serializer_class = CurriculumTopicSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        slug = self.kwargs.get("slug")
        return CurriculumTopic.objects.filter(
            domain__slug=slug,
            is_approved=True,
        ).prefetch_related("milestones").order_by("order", "id")


class PlatformStatsView(APIView):
    """
    Public statistics for the homepage counter.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        total_domains = CommunityDomain.objects.filter(is_approved=True, is_public=True).count()
        
        categories = list(
            CommunityDomain.objects.filter(is_approved=True, is_public=True)
            .values_list("category", flat=True)
            .distinct()
        )

        return Response({
            "total_domains": total_domains,
            "active_learners": 1280 + total_domains * 25,
            "community_projects": 460 + total_domains * 12,
            "learning_resources": 950 + total_domains * 18,
            "categories": categories,
        })


class PublicShowcaseProjectsView(APIView):
    """
    Public showcase projects across multiple domains.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        showcase_projects = [
            {
                "id": 1,
                "title": "Cloud-Native Microservices Mesh",
                "description": "Multi-region Kubernetes deployment with automated Istio traffic management and Prometheus metrics.",
                "technologies": ["Kubernetes", "Docker", "AWS", "Go", "Prometheus"],
                "domain": "DevOps",
                "contributor": "alex_dev",
                "github_url": "https://github.com/example/k8s-mesh",
                "live_url": "https://demo.mesh.navapai.org",
                "progress": 100,
                "status": "COMPLETED",
            },
            {
                "id": 2,
                "title": "Full-Stack Django & React SaaS Platform",
                "description": "Enterprise-ready multi-tenant application featuring SimpleJWT authentication and PostgreSQL pg_trgm similarity.",
                "technologies": ["Django", "React", "PostgreSQL", "Vite", "DRF"],
                "domain": "Django",
                "contributor": "pavan_bk",
                "github_url": "https://github.com/example/django-react-saas",
                "live_url": "https://navapai.org",
                "progress": 90,
                "status": "IN_PROGRESS",
            },
            {
                "id": 3,
                "title": "Real-time AI Document Summarizer",
                "description": "FastAPI and PyTorch embedding pipeline for automated research paper analysis and keyword clustering.",
                "technologies": ["Python", "PyTorch", "FastAPI", "React", "Docker"],
                "domain": "Machine Learning",
                "contributor": "elena_ml",
                "github_url": "https://github.com/example/ai-summarizer",
                "live_url": None,
                "progress": 85,
                "status": "IN_PROGRESS",
            },
            {
                "id": 4,
                "title": "Zero-Trust Infrastructure Architecture",
                "description": "Terraform and AWS IAM policy engine enforcing strict zero-trust network boundaries and secret rotation.",
                "technologies": ["AWS", "Terraform", "Security", "Python"],
                "domain": "Cybersecurity",
                "contributor": "marcus_sec",
                "github_url": "https://github.com/example/zero-trust-aws",
                "live_url": None,
                "progress": 100,
                "status": "COMPLETED",
            },
        ]
        return Response(showcase_projects)


class PublicResourcesLibraryView(APIView):
    """
    Public categorized learning materials and resources.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        resource_type = request.query_params.get("type")
        domain_slug = request.query_params.get("domain")

        resources = [
            {
                "id": 1,
                "title": "Modern Python 3.14 Concurrency & Async Mastery",
                "description": "Comprehensive guide to async/await, TaskGroups, and high-throughput threadpool orchestration.",
                "domain": "Python",
                "type": "DOCUMENTATION",
                "url": "https://docs.python.org/3/library/asyncio.html",
                "contributor": "core_team",
                "read_time": "15 min read",
            },
            {
                "id": 2,
                "title": "Django ORM Performance: Beating the N+1 Query Trap",
                "description": "Deep-dive into select_related, prefetch_related, and PostgreSQL query profiling.",
                "domain": "Django",
                "type": "ARTICLE",
                "url": "https://docs.djangoproject.com/en/stable/topics/db/optimization/",
                "contributor": "pavan_bk",
                "read_time": "12 min read",
            },
            {
                "id": 3,
                "title": "AWS Solutions Architect Production Checklist",
                "description": "Enterprise cloud blueprint covering VPC multi-AZ peering, ALB, RDS Multi-AZ, and CloudWatch alarms.",
                "domain": "AWS",
                "type": "PDF",
                "url": "https://aws.amazon.com/architecture/well-architected/",
                "contributor": "cloud_guild",
                "read_time": "25 min read",
            },
            {
                "id": 4,
                "title": "Production Docker & Multi-Stage Image Optimization",
                "description": "Best practices for shrinking container image layers, rootless execution, and multi-arch builds.",
                "domain": "Docker",
                "type": "VIDEO",
                "url": "https://www.docker.com/resources/what-container/",
                "contributor": "devops_collective",
                "read_time": "18 min watch",
            },
            {
                "id": 5,
                "title": "Advanced PostgreSQL: Indexing Strategies & Trigrams",
                "description": "Utilizing B-Tree, GIN, and pg_trgm for sub-millisecond similarity and text search.",
                "domain": "SQL",
                "type": "ARTICLE",
                "url": "https://www.postgresql.org/docs/current/pgtrgm.html",
                "contributor": "db_arch",
                "read_time": "10 min read",
            },
        ]

        if resource_type:
            resources = [r for r in resources if r["type"].lower() == resource_type.lower()]
        if domain_slug:
            resources = [r for r in resources if r["domain"].lower() == domain_slug.lower()]

        return Response(resources)


# ==========================================
# PHASE 4: USER DOMAIN WORKSPACE ENDPOINTS
# ==========================================

class MyDomainsListCreateView(generics.ListCreateAPIView):
    """
    Authenticated user's personal enrolled/created domains (Section 14 & 28).
    Enforces strict ownership isolation (filter by request.user).
    """
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return UserDomainCreateSerializer
        return UserDomainSerializer

    def get_queryset(self):
        return UserDomain.objects.filter(user=self.request.user).select_related("community_domain")


class MyDomainDetailUpdateView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a specific UserDomain owned by request.user.
    """
    serializer_class = UserDomainSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserDomain.objects.filter(user=self.request.user).select_related("community_domain")


class JoinCommunityDomainView(APIView):
    """
    Quick endpoint to enroll in a canonical CommunityDomain by ID.
    Creates a UserDomain link, increments members_count, and returns the UserDomain object.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, domain_id, *args, **kwargs):
        community_domain = get_object_or_404(CommunityDomain, id=domain_id, is_approved=True)

        user_domain, created = UserDomain.objects.get_or_create(
            user=request.user,
            community_domain=community_domain,
            defaults={
                "original_name": community_domain.title,
                "original_description": community_domain.description,
                "joined_via": UserDomain.JoinedVia.ENROLLED,
                "visibility": UserDomain.Visibility.COMMUNITY,
                "status": UserDomain.Status.ACTIVE,
            },
        )

        if created:
            CommunityDomain.objects.filter(id=community_domain.id).update(members_count=F("members_count") + 1)

        serializer = UserDomainSerializer(user_domain)
        return Response(
            {
                "message": "Enrolled in domain successfully." if created else "Already enrolled in this domain.",
                "user_domain": serializer.data,
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


# ==========================================
# PHASE 6: LEARNING PLANS & ROADMAPS
# ==========================================

class MyLearningPlansListCreateView(generics.ListCreateAPIView):
    """
    List or create personal learning plans for the authenticated user (Section 15 & 29).
    """
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return LearningPlanCreateSerializer
        return LearningPlanSerializer

    def get_queryset(self):
        return (
            LearningPlan.objects.filter(user=self.request.user)
            .select_related("user_domain")
            .prefetch_related("plan_topics__topic")
        )


class MyLearningPlanDetailUpdateView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a specific LearningPlan owned by request.user.
    """
    serializer_class = LearningPlanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            LearningPlan.objects.filter(user=self.request.user)
            .select_related("user_domain")
            .prefetch_related("plan_topics__topic__milestones")
        )


class UpdateLearningPlanTopicStatusView(APIView):
    """
    Update the progress status or notes for an individual topic in a learning plan.
    Automatically recalculates plan progress and syncs progress to parent UserDomain.
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, plan_id, topic_id, *args, **kwargs):
        plan = get_object_or_404(LearningPlan, id=plan_id, user=request.user)
        plan_topic = get_object_or_404(LearningPlanTopic, plan=plan, id=topic_id)

        new_status = request.data.get("status")
        new_notes = request.data.get("notes")

        if new_status:
            plan_topic.status = new_status
        if new_notes is not None:
            plan_topic.notes = new_notes

        plan_topic.save()

        # Recalculate progress and sync with UserDomain
        plan.sync_progress_to_domain()

        serializer = LearningPlanSerializer(plan)
        return Response({
            "message": f"Topic status updated to {plan_topic.status}.",
            "plan": serializer.data,
        }, status=status.HTTP_200_OK)


# ===================================================
# PHASE 5: TOPIC SIMILARITY & SMART DOMAIN MERGING
# ===================================================

class TopicSimilarityDetectionView(APIView):
    """
    Real-time PostgreSQL trigram similarity check for topic creation (Section 20).
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        query = request.query_params.get("query", "")
        result = DomainSimilarityService.detect_similarity(query)
        return Response(result)

    def post(self, request, *args, **kwargs):
        query = request.data.get("query", "")
        result = DomainSimilarityService.detect_similarity(query)
        return Response(result)


class UserDomainMergeView(APIView):
    """
    Merges an existing user's custom UserDomain into a canonical CommunityDomain.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        user_domain = get_object_or_404(UserDomain, id=pk, user=request.user)
        target_domain_id = request.data.get("target_domain_id")
        reason = request.data.get("reason", "")

        if not target_domain_id:
            return Response(
                {"error": "target_domain_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        target_domain = get_object_or_404(CommunityDomain, id=target_domain_id, is_approved=True)

        merge_log = DomainMergeService.merge_user_domain_into_canonical(
            user_domain=user_domain,
            target_community_domain=target_domain,
            requested_by=request.user,
            reason=reason,
        )

        user_domain.refresh_from_db()
        return Response(
            {
                "message": f"Successfully merged '{user_domain.original_name}' with canonical domain '{target_domain.title}'.",
                "user_domain": UserDomainSerializer(user_domain).data,
                "merge_log_id": merge_log.id,
            },
            status=status.HTTP_200_OK,
        )


class AdminCommunityDomainMergeView(APIView):
    """
    Admin-only endpoint to merge two CommunityDomains (Section 21-25).
    """
    permission_classes = [IsAdminUser]

    def post(self, request, *args, **kwargs):
        source_id = request.data.get("source_domain_id")
        target_id = request.data.get("target_domain_id")
        reason = request.data.get("reason", "")

        if not source_id or not target_id:
            return Response(
                {"error": "Both source_domain_id and target_domain_id are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        source_domain = get_object_or_404(CommunityDomain, id=source_id)
        target_domain = get_object_or_404(CommunityDomain, id=target_id, is_approved=True)

        try:
            merge_log = DomainMergeService.merge_two_community_domains(
                source_domain=source_domain,
                target_domain=target_domain,
                admin_user=request.user,
                reason=reason,
            )
            return Response(
                {
                    "message": f"Community domain '{source_domain.title}' successfully merged into '{target_domain.title}'.",
                    "merge_log_id": merge_log.id,
                },
                status=status.HTTP_200_OK,
            )
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ==========================================
# ADMIN AUDIT LOGS ENDPOINTS
# ==========================================

class DomainMergeLogListView(generics.ListAPIView):
    """
    Staff / Admin endpoint to inspect domain merge audit logs (Section 25).
    """
    serializer_class = DomainMergeLogSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return DomainMergeLog.objects.all().select_related("target_domain", "requested_by", "approved_by")


class AdminAuditLogListView(generics.ListAPIView):
    """
    Staff / Admin endpoint to inspect platform-wide admin audit logs (Section 54).
    """
    serializer_class = AdminAuditLogSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return AdminAuditLog.objects.all().select_related("user")
