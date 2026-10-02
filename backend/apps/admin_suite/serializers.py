from rest_framework import serializers
from apps.accounts.models import User
from apps.core.models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    actor_username = serializers.CharField(source="actor.username", read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "actor_username",
            "action",
            "target_model",
            "target_id",
            "ip_address",
            "details",
            "timestamp",
        ]


class AdminUserSerializer(serializers.ModelSerializer):
    profile_skills = serializers.JSONField(source="profile.skills", read_only=True)
    domains_count = serializers.SerializerMethodField()
    projects_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "role",
            "is_active",
            "is_staff",
            "is_verified",
            "profile_skills",
            "domains_count",
            "projects_count",
            "date_joined",
        ]

    def get_domains_count(self, obj) -> int:
        return getattr(obj, "userdomain_set", None).count() if hasattr(obj, "userdomain_set") else 0

    def get_projects_count(self, obj) -> int:
        return obj.projects.count() if hasattr(obj, "projects") else 0
