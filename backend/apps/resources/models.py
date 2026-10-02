from django.db import models
from django.conf import settings


class Resource(models.Model):
    """
    Curated Learning Resource (Phase 10).
    Stores technical documentation, video tutorials, articles, books, repositories, and tools.
    """
    class Type(models.TextChoices):
        DOCUMENTATION = "DOCUMENTATION", "Official Documentation"
        VIDEO = "VIDEO", "Video & Screencast"
        ARTICLE = "ARTICLE", "Article / Guide"
        BOOK = "BOOK", "Book / E-Book"
        COURSE = "COURSE", "Interactive Course"
        TOOL = "TOOL", "Dev Tool / Library"
        GITHUB_REPO = "GITHUB_REPO", "GitHub Repository"
        OTHER = "OTHER", "Other Resource"

    class Difficulty(models.TextChoices):
        BEGINNER = "BEGINNER", "Beginner"
        INTERMEDIATE = "INTERMEDIATE", "Intermediate"
        ADVANCED = "ADVANCED", "Advanced"
        ALL_LEVELS = "ALL_LEVELS", "All Levels"

    title = models.CharField(max_length=255, db_index=True)
    description = models.TextField(blank=True, default="")
    url = models.URLField(max_length=500)

    resource_type = models.CharField(
        max_length=30,
        choices=Type.choices,
        default=Type.DOCUMENTATION,
        db_index=True,
    )
    category = models.CharField(max_length=100, db_index=True, help_text="e.g. 'Cloud', 'Frontend', 'Database'")
    difficulty = models.CharField(
        max_length=20,
        choices=Difficulty.choices,
        default=Difficulty.ALL_LEVELS,
        db_index=True,
    )

    cover_image_url = models.URLField(max_length=500, blank=True, default="")
    author_or_creator = models.CharField(max_length=150, blank=True, default="")

    is_featured = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-is_featured", "-created_at"]
        verbose_name = "Learning Resource"
        verbose_name_plural = "Learning Resources"

    def __str__(self):
        return f"{self.title} ({self.resource_type})"


class Bookmark(models.Model):
    """
    User Personal Bookmark & Saved Learning Resource (Phase 10).
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bookmarks",
    )
    resource = models.ForeignKey(
        Resource,
        on_delete=models.CASCADE,
        related_name="bookmarks",
    )
    personal_notes = models.TextField(blank=True, default="", help_text="User's personal notes on this resource")
    is_favorite = models.BooleanField(default=False, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-is_favorite", "-created_at"]
        unique_together = ("user", "resource")
        verbose_name = "Resource Bookmark"
        verbose_name_plural = "Resource Bookmarks"

    def __str__(self):
        return f"{self.user.username} saved {self.resource.title}"
