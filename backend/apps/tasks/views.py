from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Sum, Count
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import WeeklyTask, SubTask
from .serializers import (
    WeeklyTaskListSerializer,
    WeeklyTaskDetailSerializer,
    WeeklyTaskCreateUpdateSerializer,
    SubTaskSerializer,
)


class WeeklyTaskListView(generics.ListCreateAPIView):
    """
    List or create personal weekly tasks for the authenticated developer (Phase 8).
    Enforces strict ownership isolation (filter by request.user).
    """
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return WeeklyTaskCreateUpdateSerializer
        return WeeklyTaskListSerializer

    def get_queryset(self):
        queryset = WeeklyTask.objects.filter(user=self.request.user).select_related(
            "user_domain", "project"
        ).prefetch_related("subtasks")

        # Filters
        week = self.request.query_params.get("week")
        year = self.request.query_params.get("year")
        if week and week.isdigit():
            queryset = queryset.filter(week_number=int(week))
        if year and year.isdigit():
            queryset = queryset.filter(year=int(year))

        task_status = self.request.query_params.get("status")
        if task_status:
            queryset = queryset.filter(status=task_status.upper())

        priority = self.request.query_params.get("priority")
        if priority:
            queryset = queryset.filter(priority=priority.upper())

        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category=category.upper())

        user_domain = self.request.query_params.get("user_domain")
        if user_domain and user_domain.isdigit():
            queryset = queryset.filter(user_domain_id=int(user_domain))

        project = self.request.query_params.get("project")
        if project and project.isdigit():
            queryset = queryset.filter(project_id=int(project))

        search = self.request.query_params.get("search")
        if search:
            q = search.strip()
            queryset = queryset.filter(
                Q(title__icontains=q) | Q(description__icontains=q)
            )

        return queryset.order_by("-priority", "due_date", "-created_at")


class WeeklyTaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a specific WeeklyTask owned by request.user.
    """
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return WeeklyTaskCreateUpdateSerializer
        return WeeklyTaskDetailSerializer

    def get_queryset(self):
        return WeeklyTask.objects.filter(user=self.request.user).select_related(
            "user_domain", "project"
        ).prefetch_related("subtasks")


class WeeklyTaskToggleStatusView(APIView):
    """
    1-Click toggle endpoint for task completion status.
    Toggles between COMPLETED and TODO / IN_PROGRESS.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        task = get_object_or_404(WeeklyTask, id=pk, user=request.user)

        if task.status == WeeklyTask.Status.COMPLETED:
            task.status = WeeklyTask.Status.TODO
            task.completed_at = None
        else:
            task.status = WeeklyTask.Status.COMPLETED
            task.completed_at = timezone.now()

        task.save()
        serializer = WeeklyTaskDetailSerializer(task)
        return Response({
            "message": f"Task '{task.title}' marked as {task.status}.",
            "task": serializer.data,
        }, status=status.HTTP_200_OK)


class SubTaskListCreateView(generics.ListCreateAPIView):
    """
    List or create sub-tasks for a specific WeeklyTask owned by request.user.
    """
    serializer_class = SubTaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        task_id = self.kwargs.get("task_id")
        return SubTask.objects.filter(task_id=task_id, task__user=self.request.user)

    def perform_create(self, serializer):
        task = get_object_or_404(WeeklyTask, id=self.kwargs.get("task_id"), user=self.request.user)
        serializer.save(task=task)


class SubTaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a sub-task.
    """
    serializer_class = SubTaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SubTask.objects.filter(task__user=self.request.user)


class WeeklyTaskStatsView(APIView):
    """
    Returns weekly productivity metrics, total tasks, completion %, and time spent.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        now = timezone.now()
        iso_year, iso_week, _ = now.isocalendar()

        week = request.query_params.get("week", iso_week)
        year = request.query_params.get("year", iso_year)

        try:
            week = int(week)
            year = int(year)
        except ValueError:
            week, year = iso_week, iso_year

        tasks_qs = WeeklyTask.objects.filter(user=request.user, year=year, week_number=week)

        total_count = tasks_qs.count()
        completed_count = tasks_qs.filter(status=WeeklyTask.Status.COMPLETED).count()
        in_progress_count = tasks_qs.filter(status=WeeklyTask.Status.IN_PROGRESS).count()
        todo_count = tasks_qs.filter(status=WeeklyTask.Status.TODO).count()
        blocked_count = tasks_qs.filter(status=WeeklyTask.Status.BLOCKED).count()

        est_minutes = tasks_qs.aggregate(Sum("estimated_minutes"))["estimated_minutes__sum"] or 0
        act_minutes = tasks_qs.aggregate(Sum("actual_minutes"))["actual_minutes__sum"] or 0

        completion_rate = int((completed_count / total_count) * 100) if total_count > 0 else 0

        return Response({
            "year": year,
            "week_number": week,
            "total_tasks": total_count,
            "completed_tasks": completed_count,
            "in_progress_tasks": in_progress_count,
            "todo_tasks": todo_count,
            "blocked_tasks": blocked_count,
            "completion_rate": completion_rate,
            "estimated_hours": round(est_minutes / 60, 1),
            "actual_hours": round(act_minutes / 60, 1),
        }, status=status.HTTP_200_OK)
