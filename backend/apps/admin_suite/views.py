from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import connection
from django.shortcuts import get_object_or_404
from apps.accounts.models import User
from apps.domains.models import CommunityDomain, UserDomain
from apps.projects.models import Project
from apps.tasks.models import WeeklyTask
from apps.community.models import CommunityContribution
from apps.core.models import AuditLog, log_audit_action
from .serializers import AuditLogSerializer, AdminUserSerializer


class SystemHealthView(APIView):
    """
    Staff/Admin System Health & Platform Analytics Overview.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Database ping test
        db_status = "HEALTHY"
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
        except Exception:
            db_status = "UNHEALTHY"

        # Platform metrics
        total_users = User.objects.count()
        total_domains = CommunityDomain.objects.count()
        enrolled_user_domains = UserDomain.objects.count()
        total_projects = Project.objects.count()
        completed_tasks = WeeklyTask.objects.filter(status=WeeklyTask.Status.COMPLETED).count()
        pending_community_reviews = CommunityContribution.objects.filter(status=CommunityContribution.Status.PENDING).count()

        return Response({
            "status": "OPERATIONAL" if db_status == "HEALTHY" else "DEGRADED",
            "database": {
                "engine": connection.vendor,
                "status": db_status,
            },
            "metrics": {
                "total_users": total_users,
                "total_domains": total_domains,
                "enrolled_user_domains": enrolled_user_domains,
                "total_projects": total_projects,
                "completed_tasks": completed_tasks,
                "pending_community_reviews": pending_community_reviews,
            },
        }, status=status.HTTP_200_OK)


class AuditLogListView(generics.ListAPIView):
    """
    List security audit logs for staff / administrators.
    """
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        queryset = AuditLog.objects.select_related("actor")
        action = self.request.query_params.get("action")
        if action:
            queryset = queryset.filter(action__icontains=action)
        return queryset[:100]


class AdminUserListView(generics.ListAPIView):
    """
    List all platform users for administrative moderation.
    """
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        queryset = User.objects.select_related("profile").prefetch_related("projects")
        search = self.request.query_params.get("search")
        if search:
            q = search.strip()
            queryset = queryset.filter(username__icontains=q) | queryset.filter(email__icontains=q)
        return queryset.order_by("-date_joined")


class AdminUserToggleActiveView(APIView):
    """
    Toggle user is_active status (Ban / Unban developer account).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        target_user = get_object_or_404(User, id=pk)
        target_user.is_active = not target_user.is_active
        target_user.save()

        log_audit_action(
            actor=request.user,
            action="USER_ACTIVE_TOGGLED",
            target_model="User",
            target_id=target_user.id,
            details={"username": target_user.username, "new_is_active": target_user.is_active},
        )

        return Response({
            "message": f"User @{target_user.username} active status set to {target_user.is_active}.",
            "is_active": target_user.is_active,
        }, status=status.HTTP_200_OK)


class AdminUserChangeRoleView(APIView):
    """
    Update user role (e.g. LEARNER, CORE_MAINTAINER, ADMIN).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        target_user = get_object_or_404(User, id=pk)
        new_role = request.data.get("role")

        if new_role not in [User.Role.LEARNER, User.Role.CORE_MAINTAINER, User.Role.ADMIN]:
            return Response({"detail": "Invalid user role choice."}, status=status.HTTP_400_BAD_REQUEST)

        target_user.role = new_role
        if new_role == User.Role.ADMIN or new_role == User.Role.CORE_MAINTAINER:
            target_user.is_staff = True
        target_user.save()

        log_audit_action(
            actor=request.user,
            action="USER_ROLE_CHANGED",
            target_model="User",
            target_id=target_user.id,
            details={"username": target_user.username, "new_role": new_role},
        )

        return Response({
            "message": f"Updated @{target_user.username} role to {target_user.role}.",
            "role": target_user.role,
        }, status=status.HTTP_200_OK)
