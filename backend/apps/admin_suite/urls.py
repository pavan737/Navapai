from django.urls import path
from .views import (
    SystemHealthView,
    AuditLogListView,
    AdminUserListView,
    AdminUserToggleActiveView,
    AdminUserChangeRoleView,
)

urlpatterns = [
    path("system-health/", SystemHealthView.as_view(), name="system-health"),
    path("audit-logs/", AuditLogListView.as_view(), name="audit-logs-list"),
    path("users/", AdminUserListView.as_view(), name="admin-users-list"),
    path("users/<int:pk>/toggle-active/", AdminUserToggleActiveView.as_view(), name="admin-user-toggle-active"),
    path("users/<int:pk>/change-role/", AdminUserChangeRoleView.as_view(), name="admin-user-change-role"),
]
