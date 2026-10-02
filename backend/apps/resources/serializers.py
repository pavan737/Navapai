from rest_framework import serializers
from .models import Resource, Bookmark


class ResourceSerializer(serializers.ModelSerializer):
    is_bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = Resource
        fields = [
            "id",
            "title",
            "description",
            "url",
            "resource_type",
            "category",
            "difficulty",
            "cover_image_url",
            "author_or_creator",
            "is_featured",
            "is_bookmarked",
            "created_at",
        ]

    def get_is_bookmarked(self, obj) -> bool:
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return Bookmark.objects.filter(user=request.user, resource=obj).exists()
        return False


class BookmarkSerializer(serializers.ModelSerializer):
    resource = ResourceSerializer(read_only=True)
    resource_id = serializers.PrimaryKeyRelatedField(
        queryset=Resource.objects.all(), write_only=True, source="resource"
    )

    class Meta:
        model = Bookmark
        fields = [
            "id",
            "resource",
            "resource_id",
            "personal_notes",
            "is_favorite",
            "created_at",
        ]

    def create(self, validated_data):
        user = self.context["request"].user
        validated_data["user"] = user
        bookmark, _ = Bookmark.objects.get_or_create(
            user=user,
            resource=validated_data["resource"],
            defaults={"personal_notes": validated_data.get("personal_notes", "")},
        )
        return bookmark
