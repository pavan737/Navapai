from django.contrib import admin
from .models import Project, ProjectScreenshot


class ProjectScreenshotInline(admin.TabularInline):
    model = ProjectScreenshot
    extra = 1
    fields = ("image_url", "caption", "order")


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "user",
        "primary_language",
        "community_domain",
        "user_domain",
        "status",
        "visibility",
        "is_featured",
        "is_showcase",
        "github_stars_count",
        "updated_at",
    )
    list_filter = ("status", "visibility", "is_featured", "is_showcase", "primary_language")
    search_fields = ("title", "slug", "tagline", "description", "user__username", "github_repo_name")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [ProjectScreenshotInline]
    readonly_fields = ("created_at", "updated_at", "github_last_synced_at", "github_metadata")
    ordering = ("-updated_at",)


@admin.register(ProjectScreenshot)
class ProjectScreenshotAdmin(admin.ModelAdmin):
    list_display = ("project", "caption", "order", "created_at")
    list_filter = ("created_at",)
    search_fields = ("project__title", "caption")
