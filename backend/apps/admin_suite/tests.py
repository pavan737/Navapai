from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User
from apps.core.models import AuditLog, log_audit_action


class AdminSuiteApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            email="admin@navapai.org",
            username="system_admin",
            password="AdminPassword2026!",
        )

        self.dev = User.objects.create_user(
            email="devuser@navapai.org",
            username="dev_user",
            password="DevPassword2026!",
        )

        log_audit_action(
            actor=self.admin,
            action="SYSTEM_INITIALIZED",
            details={"version": "2.0"},
        )

    def test_system_health(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse("system-health")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["status"], "OPERATIONAL")
        self.assertGreaterEqual(res.data["metrics"]["total_users"], 2)

    def test_audit_logs_list(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse("audit-logs-list")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data if isinstance(res.data, list) else res.data.get("results", [])
        self.assertGreaterEqual(len(results), 1)

    def test_admin_user_toggle_active(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse("admin-user-toggle-active", kwargs={"pk": self.dev.id})
        res = self.client.post(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(res.data["is_active"])
