from django.urls import path
from .views import (
    WeeklyTaskListView,
    WeeklyTaskDetailView,
    WeeklyTaskToggleStatusView,
    SubTaskListCreateView,
    SubTaskDetailView,
    WeeklyTaskStatsView,
)

urlpatterns = [
    path("my/", WeeklyTaskListView.as_view(), name="my-tasks-list-create"),
    path("my/<int:pk>/", WeeklyTaskDetailView.as_view(), name="my-task-detail"),
    path("my/<int:pk>/toggle/", WeeklyTaskToggleStatusView.as_view(), name="task-toggle-status"),
    path("my/<int:task_id>/subtasks/", SubTaskListCreateView.as_view(), name="task-subtasks-list-create"),
    path("subtasks/<int:pk>/", SubTaskDetailView.as_view(), name="subtask-detail"),
    path("stats/", WeeklyTaskStatsView.as_view(), name="tasks-weekly-stats"),
]
