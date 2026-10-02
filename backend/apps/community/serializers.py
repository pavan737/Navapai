from rest_framework import serializers
from .models import CommunityContribution, ContributionUpvote


class CommunityContributionSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source="user.username", read_only=True)
    author_full_name = serializers.CharField(source="user.get_full_name", read_only=True)
    has_upvoted = serializers.SerializerMethodField()

    class Meta:
        model = CommunityContribution
        fields = [
            "id",
            "author_username",
            "author_full_name",
            "title",
            "content",
            "category",
            "status",
            "upvotes_count",
            "has_upvoted",
            "review_notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "status", "upvotes_count", "created_at", "updated_at"]

    def get_has_upvoted(self, obj) -> bool:
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return ContributionUpvote.objects.filter(user=request.user, contribution=obj).exists()
        return False

    def create(self, validated_data):
        user = self.context["request"].user
        validated_data["user"] = user
        return super().create(validated_data)


class ModerationReviewSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=CommunityContribution.Status.choices)
    review_notes = serializers.CharField(required=False, allow_blank=True, default="")
