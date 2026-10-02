from django.core.management.base import BaseCommand
from apps.accounts.models import User
from apps.domains.models import AdminAuditLog


class Command(BaseCommand):
    help = "Creates default superuser administrator account and logs initial admin creation."

    def handle(self, *args, **options):
        email = "admin@navapai.org"
        username = "navapai_admin"
        password = "AdminPassword2026!"

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "username": username,
                "first_name": "Navapai",
                "last_name": "Admin",
                "role": User.Role.ADMIN,
                "is_staff": True,
                "is_superuser": True,
                "is_verified": True,
            },
        )

        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Superuser created successfully: {email} / {password}"))
        else:
            user.set_password(password)
            user.is_staff = True
            user.is_superuser = True
            user.role = User.Role.ADMIN
            user.save()
            self.stdout.write(self.style.WARNING(f"Superuser already exists. Password reset to: {password}"))

        # Create initial AdminAuditLog
        AdminAuditLog.objects.create(
            user=user,
            action="ADMIN_INITIALIZED",
            target_model="accounts.User",
            target_id=str(user.id),
            details={"message": "Default administrator account initialized for Navapai platform."},
        )
        self.stdout.write(self.style.SUCCESS("Initial AdminAuditLog entry recorded."))
