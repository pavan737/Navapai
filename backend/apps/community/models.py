from django.db import models
from django.conf import settings


class CommunityContribution(models.Model):
    """
    Community Knowledge Contribution Model (Phase 13).
    Supports developer-submitted technical guides, architecture blueprints, interview prep, and best practices.
    """
    class Category(models.TextChoices):
        GUIDE = "GUIDE", "Technical Guide / Tutorial"
        BLUEPRINT = "BLUEPRINT", "Architecture Blueprint"
        INTERVIEW_PREP = "INTERVIEW_PREP", "Interview Prep & Q&A"
        BEST_PRACTICES = "BEST_PRACTICES", "Production Best Practices"
        BUG_FIX = "BUG_FIX", "Troubleshooting & Bug Fix"

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending Moderation Review"
        APPROVED = "APPROVED", "Approved & Published"
        REJECTED = "REJECTED", "Needs Revisions / Rejected"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="contributions",
    )
    title = models.CharField(max_length=255, db_index=True)
    content = models.TextField(help_text="Markdown formatted contribution guide.")

    category = models.CharField(
        max_length=30,
        choices=Category.choices,
        default=Category.GUIDE,
        db_index=True,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.APPROVED,  # Default auto-approved for frictionless developer sharing
        db_index=True,
    )

    upvotes_count = models.PositiveIntegerField(default=0, db_index=True)

    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_contributions",
    )
    review_notes = models.TextField(blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-upvotes_count", "-created_at"]
        verbose_name = "Community Contribution"
        verbose_name_plural = "Community Contributions"

    def __str__(self):
        return f"{self.title} by @{self.user.username} ({self.status})"


class ContributionUpvote(models.Model):
    """
    Tracks developer upvotes on community contributions.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="contribution_upvotes",
    )
    contribution = models.ForeignKey(
        CommunityContribution,
        on_delete=models.CASCADE,
        related_name="upvotes",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "contribution")
        verbose_name = "Contribution Upvote"
        verbose_name_plural = "Contribution Upvotes"

    def __str__(self):
        return f"@{self.user.username} upvoted {self.contribution.title}"
