from django.contrib import admin
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


class DomainAliasInline(admin.TabularInline):
    model = DomainAlias
    extra = 2
    fields = ("alias", "normalized_alias")
    readonly_fields = ("normalized_alias",)


class CurriculumTopicInline(admin.TabularInline):
    model = CurriculumTopic
    extra = 1
    fields = ("title", "slug", "difficulty", "order", "estimated_hours", "is_core", "is_approved")
    prepopulated_fields = {"slug": ("title",)}


class TopicMilestoneInline(admin.TabularInline):
    model = TopicMilestone
    extra = 2
    fields = ("title", "description", "order")


class LearningPlanTopicInline(admin.TabularInline):
    model = LearningPlanTopic
    extra = 1
    fields = ("topic", "status", "notes", "order", "completed_at")
    readonly_fields = ("completed_at",)


@admin.register(CommunityDomain)
class CommunityDomainAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "slug",
        "category",
        "is_approved",
        "is_public",
        "is_featured",
        "status",
        "members_count",
        "topics_count",
        "created_at",
    )
    list_filter = ("category", "is_approved", "is_public", "is_featured", "status")
    search_fields = ("title", "slug", "normalized_title", "description", "category")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [DomainAliasInline, CurriculumTopicInline]
    ordering = ("title",)


@admin.register(CurriculumTopic)
class CurriculumTopicAdmin(admin.ModelAdmin):
    list_display = ("title", "domain", "difficulty", "order", "estimated_hours", "is_core", "is_approved")
    list_filter = ("domain", "difficulty", "is_core", "is_approved")
    search_fields = ("title", "slug", "description", "domain__title")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [TopicMilestoneInline]
    ordering = ("domain", "order")


@admin.register(TopicMilestone)
class TopicMilestoneAdmin(admin.ModelAdmin):
    list_display = ("title", "topic", "order")
    search_fields = ("title", "topic__title")


@admin.register(UserDomain)
class UserDomainAdmin(admin.ModelAdmin):
    list_display = (
        "original_name",
        "user",
        "community_domain",
        "joined_via",
        "visibility",
        "status",
        "progress",
        "updated_at",
    )
    list_filter = ("joined_via", "visibility", "status")
    search_fields = ("original_name", "user__username", "user__email", "community_domain__title")
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-updated_at",)


@admin.register(LearningPlan)
class LearningPlanAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "user_domain", "status", "progress_percentage", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("title", "user__username", "user_domain__original_name")
    inlines = [LearningPlanTopicInline]
    readonly_fields = ("created_at", "updated_at")


@admin.register(LearningPlanTopic)
class LearningPlanTopicAdmin(admin.ModelAdmin):
    list_display = ("topic", "plan", "status", "order", "completed_at")
    list_filter = ("status", "completed_at")
    search_fields = ("topic__title", "plan__title", "plan__user__username")


@admin.register(DomainMergeLog)
class DomainMergeLogAdmin(admin.ModelAdmin):
    list_display = (
        "source_domain",
        "target_domain",
        "similarity_score",
        "requested_by",
        "approved_by",
        "created_at",
    )
    list_filter = ("target_domain", "created_at")
    search_fields = ("source_domain", "target_domain__title", "reason", "requested_by__username", "approved_by__username")
    readonly_fields = ("created_at", "previous_state", "final_state")
    ordering = ("-created_at",)


@admin.register(AdminAuditLog)
class AdminAuditLogAdmin(admin.ModelAdmin):
    list_display = (
        "action",
        "target_model",
        "target_id",
        "user",
        "ip_address",
        "created_at",
    )
    list_filter = ("action", "target_model", "created_at")
    search_fields = ("action", "target_model", "target_id", "user__username", "user__email")
    readonly_fields = ("created_at", "details")
    ordering = ("-created_at",)
