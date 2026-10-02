from rest_framework import serializers
from .models import DeveloperNote


class DeveloperNoteListSerializer(serializers.ModelSerializer):
    user_domain_name = serializers.CharField(source="user_domain.original_name", read_only=True, default=None)
    project_title = serializers.CharField(source="project.title", read_only=True, default=None)
    tag_list = serializers.SerializerMethodField()
    author_username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = DeveloperNote
        fields = [
            "id",
            "author_username",
            "title",
            "content",
            "code_snippet",
            "programming_language",
            "tags",
            "tag_list",
            "is_pinned",
            "is_public",
            "user_domain",
            "user_domain_name",
            "project",
            "project_title",
            "created_at",
            "updated_at",
        ]

    def get_tag_list(self, obj):
        return obj.get_tag_list()


class DeveloperNoteDetailSerializer(serializers.ModelSerializer):
    user_domain_name = serializers.CharField(source="user_domain.original_name", read_only=True, default=None)
    project_title = serializers.CharField(source="project.title", read_only=True, default=None)
    tag_list = serializers.SerializerMethodField()
    author_username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = DeveloperNote
        fields = [
            "id",
            "author_username",
            "title",
            "content",
            "code_snippet",
            "programming_language",
            "tags",
            "tag_list",
            "is_pinned",
            "is_public",
            "user_domain",
            "user_domain_name",
            "project",
            "project_title",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_tag_list(self, obj):
        return obj.get_tag_list()


class DeveloperNoteCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeveloperNote
        fields = [
            "id",
            "title",
            "content",
            "code_snippet",
            "programming_language",
            "tags",
            "is_pinned",
            "is_public",
            "user_domain",
            "project",
        ]

    def to_internal_value(self, data):
        if isinstance(data, dict):
            data = data.copy()
            if data.get("user_domain") == "":
                data["user_domain"] = None
            if data.get("project") == "":
                data["project"] = None
        return super().to_internal_value(data)

    def create(self, validated_data):
        user = self.context["request"].user
        validated_data["user"] = user
        return super().create(validated_data)
