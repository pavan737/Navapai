from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.utils import timezone
import re


def normalize_string(val: str) -> str:
    """Normalizes string: lowercase, strips punctuation/extra whitespace."""
    if not val:
        return ""
    val = val.lower().strip()
    val = re.sub(r"[^\w\s]", "", val)
    val = re.sub(r"\s+", " ", val)
    return val


class CommunityDomain(models.Model):
    """
    Global Canonical Community Domain identity.
    Represents standardized learning categories (e.g. Python, AWS, React).
    """
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        PENDING = "PENDING", "Pending Approval"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"
        ARCHIVED = "ARCHIVED", "Archived"

    title = models.CharField(max_length=200, db_index=True)
    slug = models.SlugField(max_length=220, unique=True, db_index=True)
    normalized_title = models.CharField(max_length=200, db_index=True)
    description = models.TextField(blank=True, default="")
    category = models.CharField(max_length=100, default="Software Engineering", db_index=True)
    icon_name = models.CharField(max_length=50, blank=True, default="code")
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_community_domains",
        help_text="Null indicates core system/platform seeded domain.",
    )
    is_public = models.BooleanField(default=True, db_index=True)
    is_approved = models.BooleanField(default=True, db_index=True)
    is_featured = models.BooleanField(default=False, db_index=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.APPROVED,
        db_index=True,
    )
    parent_domain = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="subdomains",
    )
    members_count = models.PositiveIntegerField(default=0)
    topics_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["title"]
        verbose_name = "Community Domain"
        verbose_name_plural = "Community Domains"
        indexes = [
            models.Index(fields=["slug", "is_approved", "is_public"]),
            models.Index(fields=["category", "is_approved"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        self.normalized_title = normalize_string(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.category})"


class DomainAlias(models.Model):
    """
    Synonyms and alternative names for a Community Domain
    (e.g., 'Python Programming', 'Learn Python' -> 'Python').
    """
    domain = models.ForeignKey(
        CommunityDomain,
        on_delete=models.CASCADE,
        related_name="aliases",
    )
    alias = models.CharField(max_length=200)
    normalized_alias = models.CharField(max_length=200, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Domain Alias"
        verbose_name_plural = "Domain Aliases"
        unique_together = ("domain", "alias")

    def save(self, *args, **kwargs):
        self.normalized_alias = normalize_string(self.alias)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"'{self.alias}' -> {self.domain.title}"


# ==========================================
# PHASE 6: COMMUNITY CURRICULUM TOPICS
# ==========================================

class CurriculumTopic(models.Model):
    """
    Standardized, canonical curriculum topic within a CommunityDomain (Section 11).
    """
    class Difficulty(models.TextChoices):
        BEGINNER = "BEGINNER", "Beginner"
        INTERMEDIATE = "INTERMEDIATE", "Intermediate"
        ADVANCED = "ADVANCED", "Advanced"
        EXPERT = "EXPERT", "Expert"

    domain = models.ForeignKey(
        CommunityDomain,
        on_delete=models.CASCADE,
        related_name="topics",
    )
    title = models.CharField(max_length=200, db_index=True)
    slug = models.SlugField(max_length=220, db_index=True)
    description = models.TextField(blank=True, default="")
    difficulty = models.CharField(
        max_length=20,
        choices=Difficulty.choices,
        default=Difficulty.INTERMEDIATE,
    )
    order = models.PositiveIntegerField(default=0, help_text="Display order in curriculum roadmap")
    estimated_hours = models.PositiveIntegerField(default=6, help_text="Estimated learning hours")
    is_core = models.BooleanField(default=True, help_text="Part of core canonical curriculum")
    is_approved = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "title"]
        verbose_name = "Curriculum Topic"
        verbose_name_plural = "Curriculum Topics"
        unique_together = ("domain", "slug")

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.domain.title} → {self.title} ({self.difficulty})"


class TopicMilestone(models.Model):
    """
    Actionable sub-milestones within a CurriculumTopic.
    """
    topic = models.ForeignKey(
        CurriculumTopic,
        on_delete=models.CASCADE,
        related_name="milestones",
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Topic Milestone"
        verbose_name_plural = "Topic Milestones"

    def __str__(self):
        return f"{self.topic.title} Milestone: {self.title}"


# ==========================================
# PHASE 4: USER DOMAIN WORKSPACE
# ==========================================

class UserDomain(models.Model):
    """
    Bridge entity representing an individual developer's relationship
    with a learning topic / CommunityDomain (Section 14).
    CRITICAL RULE: original_name is NEVER destroyed or overwritten.
    """
    class JoinedVia(models.TextChoices):
        CREATED = "CREATED", "Created by User"
        MERGED = "MERGED", "Merged with Community"
        DISCOVERED = "DISCOVERED", "Discovered"
        ENROLLED = "ENROLLED", "Enrolled"
        ADMIN_ASSIGNED = "ADMIN_ASSIGNED", "Admin Assigned"

    class Visibility(models.TextChoices):
        PRIVATE = "PRIVATE", "Private (Only Me)"
        COMMUNITY = "COMMUNITY", "Community Members"
        PUBLIC = "PUBLIC", "Public on Portfolio"
        UNLISTED = "UNLISTED", "Unlisted"

    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "In Progress / Active"
        COMPLETED = "COMPLETED", "Completed"
        ARCHIVED = "ARCHIVED", "Archived"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="user_domains",
    )
    community_domain = models.ForeignKey(
        CommunityDomain,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="user_enrollments",
        help_text="Canonical community domain link. Null if private custom topic.",
    )
    original_name = models.CharField(
        max_length=200,
        db_index=True,
        help_text="User's original topic name (e.g. 'Python Development'). Preserved forever.",
    )
    original_description = models.TextField(blank=True, default="")
    joined_via = models.CharField(
        max_length=30,
        choices=JoinedVia.choices,
        default=JoinedVia.ENROLLED,
    )
    visibility = models.CharField(
        max_length=20,
        choices=Visibility.choices,
        default=Visibility.COMMUNITY,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
    )
    progress = models.PositiveIntegerField(
        default=0,
        help_text="Calculated percentage (0-100%)",
    )
    target_date = models.DateField(null=True, blank=True)
    custom_notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        verbose_name = "User Domain"
        verbose_name_plural = "User Domains"
        constraints = [
            models.UniqueConstraint(
                fields=["user", "community_domain"],
                condition=models.Q(community_domain__isnull=False, status="ACTIVE"),
                name="unique_active_user_community_domain",
            )
        ]

    def __str__(self):
        canonical = f" -> {self.community_domain.title}" if self.community_domain else " (Private)"
        return f"{self.user.username}: '{self.original_name}'{canonical}"


# ==========================================
# PHASE 6: PERSONAL LEARNING PLANS & ROADMAPS
# ==========================================

class LearningPlan(models.Model):
    """
    Individual structured study plan tracking topic-level mastery (Section 15 & 29).
    """
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        ACTIVE = "ACTIVE", "Active"
        PAUSED = "PAUSED", "Paused"
        COMPLETED = "COMPLETED", "Completed"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="learning_plans",
    )
    user_domain = models.ForeignKey(
        UserDomain,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="learning_plans",
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    target_completion_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        verbose_name = "Learning Plan"
        verbose_name_plural = "Learning Plans"

    @property
    def total_topics(self) -> int:
        return self.plan_topics.count()

    @property
    def completed_topics(self) -> int:
        return self.plan_topics.filter(status="COMPLETED").count()

    @property
    def progress_percentage(self) -> int:
        total = self.total_topics
        if total == 0:
            return 0
        return int((self.completed_topics / total) * 100)

    def sync_progress_to_domain(self):
        """Syncs the computed completion percentage to the parent UserDomain."""
        pct = self.progress_percentage
        if self.user_domain:
            self.user_domain.progress = pct
            if pct >= 100:
                self.user_domain.status = UserDomain.Status.COMPLETED
                self.status = LearningPlan.Status.COMPLETED
            self.user_domain.save(update_fields=["progress", "status", "updated_at"])

    def __str__(self):
        return f"{self.user.username}'s Roadmap: {self.title} ({self.progress_percentage}%)"


class LearningPlanTopic(models.Model):
    """
    Individual topic progress entry within a user's LearningPlan.
    """
    class ProgressStatus(models.TextChoices):
        NOT_STARTED = "NOT_STARTED", "Not Started"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        COMPLETED = "COMPLETED", "Completed"
        BLOCKED = "BLOCKED", "Blocked"

    plan = models.ForeignKey(
        LearningPlan,
        on_delete=models.CASCADE,
        related_name="plan_topics",
    )
    topic = models.ForeignKey(
        CurriculumTopic,
        on_delete=models.CASCADE,
        related_name="plan_entries",
    )
    status = models.CharField(
        max_length=20,
        choices=ProgressStatus.choices,
        default=ProgressStatus.NOT_STARTED,
    )
    notes = models.TextField(blank=True, default="")
    order = models.PositiveIntegerField(default=0)
    completed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Learning Plan Topic"
        verbose_name_plural = "Learning Plan Topics"
        unique_together = ("plan", "topic")

    def save(self, *args, **kwargs):
        if self.status == self.ProgressStatus.COMPLETED and not self.completed_at:
            self.completed_at = timezone.now()
        elif self.status != self.ProgressStatus.COMPLETED:
            self.completed_at = None
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.plan.title} → {self.topic.title}: {self.status}"


# ==========================================
# PHASE 5: AUDIT LOG MODELS
# ==========================================

class DomainMergeLog(models.Model):
    """
    Immutable audit log tracking all domain merges, similarity scores,
    requestors, and approving administrators (Section 25).
    """
    source_domain = models.CharField(max_length=200, help_text="Original topic or domain name requested to merge")
    target_domain = models.ForeignKey(
        CommunityDomain,
        on_delete=models.CASCADE,
        related_name="merge_logs",
        help_text="Canonical target domain",
    )
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="domain_merge_requests",
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="domain_merge_approvals",
    )
    similarity_score = models.FloatField(default=0.0, help_text="PostgreSQL trigram similarity percentage (e.g., 0.94 for 94%)")
    reason = models.TextField(blank=True, default="")
    previous_state = models.JSONField(default=dict, blank=True)
    final_state = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Domain Merge Audit Log"
        verbose_name_plural = "Domain Merge Audit Logs"

    def __str__(self):
        return f"Merge Log: '{self.source_domain}' -> {self.target_domain.title} ({self.similarity_score * 100:.1f}%)"


class AdminAuditLog(models.Model):
    """
    General administrator & moderation audit log tracking important operations
    across the platform (Section 54).
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="admin_actions",
    )
    action = models.CharField(max_length=100, db_index=True)
    target_model = models.CharField(max_length=100)
    target_id = models.CharField(max_length=100, blank=True, default="")
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Admin Audit Log"
        verbose_name_plural = "Admin Audit Logs"

    def __str__(self):
        user_str = self.user.username if self.user else "System"
        return f"[{self.created_at.strftime('%Y-%m-%d %H:%M')}] {user_str} -> {self.action} on {self.target_model}"
