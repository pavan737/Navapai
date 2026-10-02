from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User
from apps.tasks.models import WeeklyTask


class AnalyticsApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="analyticdev@navapai.org",
            username="analytic_dev",
            password="DevPassword2026!",
        )

        WeeklyTask.objects.create(
            user=self.user,
            title="Completed Task for Heatmap Test",
            status=WeeklyTask.Status.COMPLETED,
            week_number=34,
            year=2026,
        )

    def test_dashboard_analytics(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("dashboard-analytics")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["counts"]["completed_tasks"], 1)

    def test_heatmap_matrix(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("activity-heatmap")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data["heatmap"]), 365)
