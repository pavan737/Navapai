from django.db import models
from django.conf import settings
from django.utils.text import slugify
from apps.domains.models import UserDomain, CommunityDomain


class Project(models.Model):
    """
    Developer Portfolio & Showcase Project (Section 12, 16 & 33).
    Represents production repositories, cloud architectures, and prototypes.
    """
    class Status(models.TextChoices):
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        COMPLETED = "COMPLETED", "Completed"
        MAINTENANCE = "MAINTENANCE", "Maintenance"
        ARCHIVED = "ARCHIVED", "Archived"

    class Visibility(models.TextChoices):
        PRIVATE = "PRIVATE", "Private (Only Me)"
        COMMUNITY = "COMMUNITY", "Community Developers"
        PUBLIC = "PUBLIC", "Public on Portfolio"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="projects",
    )
    user_domain = models.ForeignKey(
        UserDomain,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="projects",
        help_text="Link to developer's enrolled domain workspace.",
    )
    community_domain = models.ForeignKey(
        CommunityDomain,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="domain_projects",
        help_text="Canonical community domain category (e.g. Django, AWS).",
    )
    title = models.CharField(max_length=200, db_index=True)
    slug = models.SlugField(max_length=240, db_index=True)
    tagline = models.CharField(max_length=255, blank=True, default="", help_text="Short one-line architectural summary")
    description = models.TextField(blank=True, default="")
    
    # URLs
    github_url = models.URLField(max_length=400, blank=True, default="")
    live_demo_url = models.URLField(max_length=400, blank=True, default="")
    
    # Tech Stack
    primary_language = models.CharField(max_length=100, blank=True, default="Python")
    technologies = models.JSONField(default=list, blank=True, help_text="List of tech tags e.g. ['Django', 'React', 'PostgreSQL']")
    
    # State & Visibility
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.IN_PROGRESS,
        db_index=True,
    )
    visibility = models.CharField(
        max_length=20,
        choices=Visibility.choices,
        default=Visibility.PUBLIC,
        db_index=True,
    )
    is_featured = models.BooleanField(default=False, help_text="Featured on developer's personal portfolio")
    is_showcase = models.BooleanField(default=False, db_index=True, help_text="Promoted to global Navapai community showcase")

    # GitHub Repository Sync Fields
    github_repo_id = models.BigIntegerField(null=True, blank=True)
    github_owner = models.CharField(max_length=100, blank=True, default="")
    github_repo_name = models.CharField(max_length=100, blank=True, default="")
    github_stars_count = models.PositiveIntegerField(default=0)
    github_forks_count = models.PositiveIntegerField(default=0)
    github_open_issues = models.PositiveIntegerField(default=0)
    github_default_branch = models.CharField(max_length=50, default="main")
    github_last_synced_at = models.DateTimeField(null=True, blank=True)
    github_metadata = models.JSONField(default=dict, blank=True, help_text="Full repository metadata, topics, license, language breakdown")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_featured", "-updated_at"]
        verbose_name = "Project"
        verbose_name_plural = "Projects"
        indexes = [
            models.Index(fields=["visibility", "is_showcase"]),
            models.Index(fields=["user", "status"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title) or "project"
            self.slug = f"{base_slug}-{self.user.username}"[:230]
        
        # Auto-link community_domain from user_domain if present
        if self.user_domain and self.user_domain.community_domain and not self.community_domain:
            self.community_domain = self.user_domain.community_domain

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} / {self.title} ({self.status})"


class ProjectScreenshot(models.Model):
    """
    Screenshots and architecture diagram attachments for a project.
    """
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="screenshots",
    )
    image_url = models.URLField(max_length=500)
    caption = models.CharField(max_length=200, blank=True, default="")
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Project Screenshot"
        verbose_name_plural = "Project Screenshots"

    def __str__(self):
        return f"{self.project.title} Screenshot #{self.order}"
