from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User
from .models import Certification, CareerMilestone


class CareerApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="careerdev@navapai.org",
            username="career_dev",
            password="DevPassword2026!",
        )

        self.cert = Certification.objects.create(
            user=self.user,
            title="AWS Certified Solutions Architect - Associate",
            issuing_organization="Amazon Web Services",
            issue_date="2025-06-15",
            credential_id="AWS-12345678",
            credential_url="https://aws.amazon.com/verification",
            is_verified=True,
        )

        self.milestone = CareerMilestone.objects.create(
            user=self.user,
            title="Promoted to Senior DevOps Engineer",
            company_or_org="TechCorp Cloud Systems",
            milestone_type="PROMOTION",
            date_achieved="2026-01-10",
            description="Led Kubernetes migration for microservices.",
        )

    def test_list_certifications(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("certifications-list-create")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data if isinstance(res.data, list) else res.data.get("results", [])
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["title"], "AWS Certified Solutions Architect - Associate")

    def test_create_career_milestone(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("milestones-list-create")
        res = self.client.post(url, {
            "title": "Speaker at PyCon Cloud 2026",
            "company_or_org": "PyCon",
            "milestone_type": "SPEAKER",
            "date_achieved": "2026-05-20",
            "description": "Delivered talk on Django microservices performance.",
        }, format="json")

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["title"], "Speaker at PyCon Cloud 2026")

    def test_public_career_timeline(self):
        url = reverse("public-career-timeline", kwargs={"username": self.user.username})
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data["certifications"]), 1)
        self.assertEqual(len(res.data["milestones"]), 1)
