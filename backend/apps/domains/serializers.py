from rest_framework import serializers
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


class DomainAliasSerializer(serializers.ModelSerializer):
    class Meta:
        model = DomainAlias
        fields = ["id", "alias", "normalized_alias"]


class SubdomainSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunityDomain
        fields = ["id", "title", "slug", "description", "category", "icon_name"]


class TopicMilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = TopicMilestone
        fields = ["id", "title", "description", "order"]


class CurriculumTopicSerializer(serializers.ModelSerializer):
    milestones = TopicMilestoneSerializer(many=True, read_only=True)
    domain_title = serializers.CharField(source="domain.title", read_only=True)
    domain_slug = serializers.CharField(source="domain.slug", read_only=True)

    class Meta:
        model = CurriculumTopic
        fields = [
            "id",
            "domain",
            "domain_title",
            "domain_slug",
            "title",
            "slug",
            "description",
            "difficulty",
            "order",
            "estimated_hours",
            "is_core",
            "milestones",
            "created_at",
        ]


class CommunityDomainListSerializer(serializers.ModelSerializer):
    aliases = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field="alias",
    )

    class Meta:
        model = CommunityDomain
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "category",
            "icon_name",
            "is_featured",
            "members_count",
            "topics_count",
            "aliases",
            "created_at",
        ]


class CommunityDomainDetailSerializer(serializers.ModelSerializer):
    aliases = DomainAliasSerializer(many=True, read_only=True)
    subdomains = SubdomainSerializer(many=True, read_only=True)
    topics = CurriculumTopicSerializer(many=True, read_only=True)
    parent_title = serializers.CharField(source="parent_domain.title", read_only=True, default=None)

    class Meta:
        model = CommunityDomain
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "category",
            "icon_name",
            "is_featured",
            "status",
            "parent_domain",
            "parent_title",
            "subdomains",
            "members_count",
            "topics_count",
            "topics",
            "aliases",
            "created_at",
            "updated_at",
        ]


class UserDomainCommunitySummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunityDomain
        fields = ["id", "title", "slug", "category", "icon_name", "topics_count"]


class UserDomainSerializer(serializers.ModelSerializer):
    community_domain_details = UserDomainCommunitySummarySerializer(source="community_domain", read_only=True)

    class Meta:
        model = UserDomain
        fields = [
            "id",
            "community_domain",
            "community_domain_details",
            "original_name",
            "original_description",
            "joined_via",
            "visibility",
            "status",
            "progress",
            "target_date",
            "custom_notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class UserDomainCreateSerializer(serializers.ModelSerializer):
    target_date = serializers.DateField(required=False, allow_null=True)

    class Meta:
        model = UserDomain
        fields = [
            "id",
            "community_domain",
            "original_name",
            "original_description",
            "visibility",
            "target_date",
            "custom_notes",
        ]

    def to_internal_value(self, data):
        if isinstance(data, dict) and data.get("target_date") == "":
            data = data.copy()
            data["target_date"] = None
        return super().to_internal_value(data)

    def create(self, validated_data):
        user = self.context["request"].user
        community_domain = validated_data.get("community_domain")
        original_name = validated_data.get("original_name")

        if community_domain and not original_name:
            validated_data["original_name"] = community_domain.title
            validated_data["joined_via"] = UserDomain.JoinedVia.ENROLLED
        elif not community_domain:
            validated_data["joined_via"] = UserDomain.JoinedVia.CREATED

        validated_data["user"] = user
        return super().create(validated_data)


# ==========================================
# PHASE 6: LEARNING PLAN SERIALIZERS
# ==========================================

class LearningPlanTopicSerializer(serializers.ModelSerializer):
    topic_details = CurriculumTopicSerializer(source="topic", read_only=True)

    class Meta:
        model = LearningPlanTopic
        fields = [
            "id",
            "plan",
            "topic",
            "topic_details",
            "status",
            "notes",
            "order",
            "completed_at",
            "updated_at",
        ]


class LearningPlanSerializer(serializers.ModelSerializer):
    plan_topics = LearningPlanTopicSerializer(many=True, read_only=True)
    total_topics = serializers.IntegerField(read_only=True)
    completed_topics = serializers.IntegerField(read_only=True)
    progress_percentage = serializers.IntegerField(read_only=True)
    user_domain_name = serializers.CharField(source="user_domain.original_name", read_only=True, default=None)

    class Meta:
        model = LearningPlan
        fields = [
            "id",
            "user",
            "user_domain",
            "user_domain_name",
            "title",
            "description",
            "target_completion_date",
            "status",
            "total_topics",
            "completed_topics",
            "progress_percentage",
            "plan_topics",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]


class LearningPlanCreateSerializer(serializers.ModelSerializer):
    target_completion_date = serializers.DateField(required=False, allow_null=True)
    auto_populate_topics = serializers.BooleanField(default=True, write_only=True)

    class Meta:
        model = LearningPlan
        fields = [
            "id",
            "user_domain",
            "title",
            "description",
            "target_completion_date",
            "auto_populate_topics",
        ]

    def to_internal_value(self, data):
        if isinstance(data, dict) and data.get("target_completion_date") == "":
            data = data.copy()
            data["target_completion_date"] = None
        return super().to_internal_value(data)

    def create(self, validated_data):
        user = self.context["request"].user
        auto_populate = validated_data.pop("auto_populate_topics", True)
        user_domain = validated_data.get("user_domain")

        if not validated_data.get("title") and user_domain:
            validated_data["title"] = f"{user_domain.original_name} Mastery Roadmap"

        validated_data["user"] = user
        learning_plan = super().create(validated_data)

        # Auto populate topics from canonical CommunityDomain if available
        if auto_populate and user_domain and user_domain.community_domain:
            canonical_topics = CurriculumTopic.objects.filter(
                domain=user_domain.community_domain,
                is_approved=True,
            ).order_by("order", "id")

            plan_topics = [
                LearningPlanTopic(
                    plan=learning_plan,
                    topic=topic,
                    order=index + 1,
                    status=LearningPlanTopic.ProgressStatus.NOT_STARTED,
                )
                for index, topic in enumerate(canonical_topics)
            ]
            if plan_topics:
                LearningPlanTopic.objects.bulk_create(plan_topics)

        return learning_plan


# ==========================================
# AUDIT LOG SERIALIZERS
# ==========================================

class DomainMergeLogSerializer(serializers.ModelSerializer):
    target_domain_title = serializers.CharField(source="target_domain.title", read_only=True)
    requested_by_username = serializers.CharField(source="requested_by.username", read_only=True, default=None)
    approved_by_username = serializers.CharField(source="approved_by.username", read_only=True, default=None)

    class Meta:
        model = DomainMergeLog
        fields = [
            "id",
            "source_domain",
            "target_domain",
            "target_domain_title",
            "requested_by",
            "requested_by_username",
            "approved_by",
            "approved_by_username",
            "similarity_score",
            "reason",
            "previous_state",
            "final_state",
            "created_at",
        ]


class AdminAuditLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True, default="System")

    class Meta:
        model = AdminAuditLog
        fields = [
            "id",
            "user",
            "username",
            "action",
            "target_model",
            "target_id",
            "details",
            "ip_address",
            "created_at",
        ]
