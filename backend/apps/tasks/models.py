from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.domains.models import UserDomain
from apps.projects.models import Project


class WeeklyTask(models.Model):
    """
    Developer Weekly Task & To-Do item (Phase 8).
    Tracks developer goals, time estimates, priority, status, and domain/project linkage.
    """
    class Status(models.TextChoices):
        TODO = "TODO", "To Do"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        COMPLETED = "COMPLETED", "Completed"
        BLOCKED = "BLOCKED", "Blocked"

    class Priority(models.TextChoices):
        LOW = "LOW", "Low"
        MEDIUM = "MEDIUM", "Medium"
        HIGH = "HIGH", "High"
        URGENT = "URGENT", "Urgent"

    class Category(models.TextChoices):
        LEARNING = "LEARNING", "Learning & Theory"
        CODING = "CODING", "Coding & Dev"
        ARCHITECTURE = "ARCHITECTURE", "Architecture & Design"
        REVIEW = "REVIEW", "Code Review & Refactoring"
        OTHER = "OTHER", "General / Other"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="weekly_tasks",
    )
    user_domain = models.ForeignKey(
        UserDomain,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tasks",
        help_text="Optional link to user's enrolled domain workspace.",
    )
    project = models.ForeignKey(
        Project,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tasks",
        help_text="Optional link to developer's portfolio project.",
    )

    title = models.CharField(max_length=255, db_index=True)
    description = models.TextField(blank=True, default="")

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.TODO,
        db_index=True,
    )
    priority = models.CharField(
        max_length=20,
        choices=Priority.choices,
        default=Priority.MEDIUM,
        db_index=True,
    )
    category = models.CharField(
        max_length=25,
        choices=Category.choices,
        default=Category.LEARNING,
        db_index=True,
    )

    week_number = models.PositiveIntegerField(db_index=True)
    year = models.PositiveIntegerField(db_index=True)

    due_date = models.DateField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    estimated_minutes = models.PositiveIntegerField(default=60, help_text="Estimated completion time in minutes")
    actual_minutes = models.PositiveIntegerField(default=0, help_text="Actual time spent in minutes")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-priority", "due_date", "-created_at"]
        verbose_name = "Weekly Task"
        verbose_name_plural = "Weekly Tasks"
        indexes = [
            models.Index(fields=["user", "year", "week_number"]),
            models.Index(fields=["user", "status"]),
        ]

    def save(self, *args, **kwargs):
        now = timezone.now()
        if not self.week_number or not self.year:
            iso_year, iso_week, _ = now.isocalendar()
            if not self.year:
                self.year = iso_year
            if not self.week_number:
                self.week_number = iso_week

        if self.status == self.Status.COMPLETED and not self.completed_at:
            self.completed_at = now
        elif self.status != self.Status.COMPLETED:
            self.completed_at = None

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - Week {self.week_number}/{self.year}: {self.title} ({self.status})"


class SubTask(models.Model):
    """
    Sub-task item / checklist item belonging to a WeeklyTask.
    """
    task = models.ForeignKey(
        WeeklyTask,
        on_delete=models.CASCADE,
        related_name="subtasks",
    )
    title = models.CharField(max_length=255)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]
        verbose_name = "Sub Task"
        verbose_name_plural = "Sub Tasks"

    def __str__(self):
        return f"[{'X' if self.is_completed else ' '}] {self.title}"
