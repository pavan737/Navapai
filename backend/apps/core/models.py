from django.db import models
from django.conf import settings


class AuditLog(models.Model):
    """
    Security Audit Log Model (Phase 16).
    Tracks administrative events, moderation actions, and user security activities across Navapai.
    """
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_actions",
    )
    action = models.CharField(max_length=100, db_index=True)
    target_model = models.CharField(max_length=100, blank=True, default="")
    target_id = models.CharField(max_length=100, blank=True, default="")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    details = models.JSONField(default=dict, blank=True)

    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-timestamp"]
        verbose_name = "Audit Log"
        verbose_name_plural = "Audit Logs"

    def __str__(self):
        actor_str = f"@{self.actor.username}" if self.actor else "System"
        return f"[{self.timestamp.strftime('%Y-%m-%d %H:%M')}] {actor_str}: {self.action}"


def log_audit_action(actor=None, action="", target_model="", target_id="", ip_address=None, details=None):
    """
    Helper utility to record security audit logs.
    """
    try:
        AuditLog.objects.create(
            actor=actor if (actor and actor.is_authenticated) else None,
            action=action,
            target_model=target_model,
            target_id=str(target_id) if target_id else "",
            ip_address=ip_address,
            details=details or {},
        )
    except Exception as e:
        print(f"Failed to record audit log: {e}")
