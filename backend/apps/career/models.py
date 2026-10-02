from django.db import models
from django.conf import settings


class Certification(models.Model):
    """
    Developer Professional Certification Model (Phase 11).
    Tracks industry credentials (e.g., AWS Certified, CKA, GCP Professional, PMP).
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="certifications",
    )
    title = models.CharField(max_length=255, db_index=True)
    issuing_organization = models.CharField(max_length=255)

    issue_date = models.DateField()
    expiration_date = models.DateField(null=True, blank=True)

    credential_id = models.CharField(max_length=255, blank=True, default="")
    credential_url = models.URLField(max_length=500, blank=True, default="")
    badge_icon_url = models.URLField(max_length=500, blank=True, default="")

    is_verified = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-issue_date"]
        verbose_name = "Certification"
        verbose_name_plural = "Certifications"

    def __str__(self):
        return f"{self.user.username} - {self.title} ({self.issuing_organization})"


class CareerMilestone(models.Model):
    """
    Developer Career Timeline & Achievement Milestone (Phase 11).
    """
    class MilestoneType(models.TextChoices):
        JOB = "JOB", "New Job / Role"
        PROMOTION = "PROMOTION", "Promotion"
        CERTIFICATION = "CERTIFICATION", "Certification Earned"
        PROJECT_LAUNCH = "PROJECT_LAUNCH", "Project Launch"
        OPEN_SOURCE = "OPEN_SOURCE", "Open Source Milestone"
        SPEAKER = "SPEAKER", "Tech Talk / Speaker"
        OTHER = "OTHER", "General Milestone"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="career_milestones",
    )
    title = models.CharField(max_length=255, db_index=True)
    company_or_org = models.CharField(max_length=255, blank=True, default="")
    milestone_type = models.CharField(
        max_length=30,
        choices=MilestoneType.choices,
        default=MilestoneType.JOB,
        db_index=True,
    )
    date_achieved = models.DateField()
    description = models.TextField(blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date_achieved"]
        verbose_name = "Career Milestone"
        verbose_name_plural = "Career Milestones"

    def __str__(self):
        return f"{self.user.username} - {self.title} ({self.date_achieved})"
