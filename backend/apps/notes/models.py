from django.db import models
from django.conf import settings
from apps.domains.models import UserDomain
from apps.projects.models import Project


class DeveloperNote(models.Model):
    """
    Developer Note & Code Snippet model (Phase 9).
    Supports Markdown notes, syntax-highlighted code snippets, pinning, and domain/project linkage.
    """
    class Language(models.TextChoices):
        PYTHON = "python", "Python"
        JAVASCRIPT = "javascript", "JavaScript"
        TYPESCRIPT = "typescript", "TypeScript"
        SQL = "sql", "SQL"
        BASH = "bash", "Bash / Shell"
        DOCKERFILE = "dockerfile", "Dockerfile"
        YAML = "yaml", "YAML / Config"
        JSON = "json", "JSON"
        MARKDOWN = "markdown", "Markdown"
        PLAINTEXT = "plaintext", "Plain Text"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="developer_notes",
    )
    user_domain = models.ForeignKey(
        UserDomain,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="notes",
    )
    project = models.ForeignKey(
        Project,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="notes",
    )

    title = models.CharField(max_length=255, db_index=True)
    content = models.TextField(help_text="Markdown formatted notes and explanations.")
    code_snippet = models.TextField(blank=True, default="", help_text="Optional raw code snippet.")
    programming_language = models.CharField(
        max_length=50,
        choices=Language.choices,
        default=Language.PYTHON,
        db_index=True,
    )

    tags = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Comma-separated tags e.g. 'jwt, postgres, auth'",
    )

    is_pinned = models.BooleanField(default=False, db_index=True)
    is_public = models.BooleanField(default=False, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_pinned", "-updated_at"]
        verbose_name = "Developer Note"
        verbose_name_plural = "Developer Notes"
        indexes = [
            models.Index(fields=["user", "is_pinned"]),
            models.Index(fields=["is_public"]),
        ]

    def get_tag_list(self):
        if not self.tags:
            return []
        return [t.strip().lstrip('#') for t in self.tags.split(',') if t.strip()]

    def __str__(self):
        return f"{self.user.username} - {self.title} ({self.programming_language})"
