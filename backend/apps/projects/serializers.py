from rest_framework import serializers
from .models import Project, ProjectScreenshot
from .services import GitHubSyncService


class ProjectScreenshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectScreenshot
        fields = ["id", "image_url", "caption", "order", "created_at"]


class ProjectListSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source="user.username", read_only=True)
    user_full_name = serializers.CharField(source="user.get_full_name", read_only=True)
    user_domain_name = serializers.CharField(source="user_domain.original_name", read_only=True, default=None)
    community_domain_title = serializers.CharField(source="community_domain.title", read_only=True, default=None)
    community_domain_slug = serializers.CharField(source="community_domain.slug", read_only=True, default=None)

    class Meta:
        model = Project
        fields = [
            "id",
            "user",
            "user_username",
            "user_full_name",
            "user_domain",
            "user_domain_name",
            "community_domain",
            "community_domain_title",
            "community_domain_slug",
            "title",
            "slug",
            "tagline",
            "description",
            "github_url",
            "live_demo_url",
            "primary_language",
            "technologies",
            "status",
            "visibility",
            "is_featured",
            "is_showcase",
            "github_stars_count",
            "github_forks_count",
            "github_open_issues",
            "created_at",
            "updated_at",
        ]


class ProjectDetailSerializer(serializers.ModelSerializer):
    screenshots = ProjectScreenshotSerializer(many=True, read_only=True)
    user_username = serializers.CharField(source="user.username", read_only=True)
    user_full_name = serializers.CharField(source="user.get_full_name", read_only=True)
    user_avatar = serializers.CharField(source="user.profile.avatar_url", read_only=True, default=None)
    user_domain_name = serializers.CharField(source="user_domain.original_name", read_only=True, default=None)
    community_domain_title = serializers.CharField(source="community_domain.title", read_only=True, default=None)
    community_domain_slug = serializers.CharField(source="community_domain.slug", read_only=True, default=None)

    class Meta:
        model = Project
        fields = [
            "id",
            "user",
            "user_username",
            "user_full_name",
            "user_avatar",
            "user_domain",
            "user_domain_name",
            "community_domain",
            "community_domain_title",
            "community_domain_slug",
            "title",
            "slug",
            "tagline",
            "description",
            "github_url",
            "live_demo_url",
            "primary_language",
            "technologies",
            "status",
            "visibility",
            "is_featured",
            "is_showcase",
            "github_repo_id",
            "github_owner",
            "github_repo_name",
            "github_stars_count",
            "github_forks_count",
            "github_open_issues",
            "github_default_branch",
            "github_last_synced_at",
            "github_metadata",
            "screenshots",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]


class ProjectCreateUpdateSerializer(serializers.ModelSerializer):
    auto_sync_github = serializers.BooleanField(default=True, write_only=True)

    class Meta:
        model = Project
        fields = [
            "id",
            "user_domain",
            "community_domain",
            "title",
            "tagline",
            "description",
            "github_url",
            "live_demo_url",
            "primary_language",
            "technologies",
            "status",
            "visibility",
            "is_featured",
            "auto_sync_github",
        ]

    def to_internal_value(self, data):
        if isinstance(data, dict):
            data = data.copy()
            if data.get("user_domain") == "":
                data["user_domain"] = None
            if data.get("community_domain") == "":
                data["community_domain"] = None
            if data.get("live_demo_url") is None:
                data["live_demo_url"] = ""
            if data.get("github_url") is None:
                data["github_url"] = ""
        return super().to_internal_value(data)

    def create(self, validated_data):
        user = self.context["request"].user
        auto_sync = validated_data.pop("auto_sync_github", True)
        validated_data["user"] = user

        project = super().create(validated_data)

        if auto_sync and project.github_url:
            try:
                GitHubSyncService.sync_project(project)
            except Exception:
                pass

        return project

    def update(self, instance, validated_data):
        auto_sync = validated_data.pop("auto_sync_github", False)
        project = super().update(instance, validated_data)

        if auto_sync and project.github_url:
            try:
                GitHubSyncService.sync_project(project)
            except Exception:
                pass

        return project
