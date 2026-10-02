from django.db import models
from django.conf import settings


class AchievementBadge(models.Model):
    """
    Developer Achievement Badge definition (Phase 12).
    Represents gamified skill badges awarded for platform engagement & learning milestones.
    """
    class Category(models.TextChoices):
        LEARNING = "LEARNING", "Domain Learning & Plans"
        PROJECTS = "PROJECTS", "Projects & GitHub"
        TASKS = "TASKS", "Weekly Tasks & To-Dos"
        NOTES = "NOTES", "Developer Notes"
        RESOURCES = "RESOURCES", "Bookmarks & Library"
        CAREER = "CAREER", "Certifications & Milestones"
        COMMUNITY = "COMMUNITY", "Community & Showcase"

    slug = models.SlugField(unique=True, db_index=True)
    name = models.CharField(max_length=150)
    description = models.TextField()
    icon_name = models.CharField(max_length=50, default="Award", help_text="Lucide Icon Name e.g. 'Award', 'Zap', 'ShieldCheck'")
    category = models.CharField(
        max_length=30,
        choices=Category.choices,
        default=Category.LEARNING,
        db_index=True,
    )

    points_reward = models.PositiveIntegerField(default=50, help_text="XP awarded when unlocked")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["category", "points_reward", "name"]
        verbose_name = "Achievement Badge"
        verbose_name_plural = "Achievement Badges"

    def __str__(self):
        return f"{self.name} (+{self.points_reward} XP)"


class UserAchievement(models.Model):
    """
    Tracks which badges have been unlocked by a developer.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="achievements",
    )
    badge = models.ForeignKey(
        AchievementBadge,
        on_delete=models.CASCADE,
        related_name="user_achievements",
    )
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "badge")
        ordering = ["-unlocked_at"]
        verbose_name = "User Achievement"
        verbose_name_plural = "User Achievements"

    def __str__(self):
        return f"{self.user.username} unlocked {self.badge.name}"
