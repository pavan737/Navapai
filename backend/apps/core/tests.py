from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status


class HealthCheckTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_health_check_endpoint(self):
        response = self.client.get(reverse("health-check"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "healthy")
        self.assertEqual(response.data["service"], "Navapai Backend API")
        self.assertIn("database", response.data)
        self.assertEqual(response.data["database"]["status"], "healthy")
