from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User
from .models import CommunityContribution, ContributionUpvote


class CommunityApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="commdev@navapai.org",
            username="comm_dev",
            password="DevPassword2026!",
        )

        self.contribution1 = CommunityContribution.objects.create(
            user=self.user,
            title="PostgreSQL Indexing & Partitioning Guide",
            content="Comprehensive guide to B-Tree, GIN, and BRIN indexes.",
            category="BEST_PRACTICES",
            status="APPROVED",
        )

    def test_public_community_list(self):
        url = reverse("community-list")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data if isinstance(res.data, list) else res.data.get("results", [])
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["title"], "PostgreSQL Indexing & Partitioning Guide")

    def test_upvote_contribution(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("contribution-upvote", kwargs={"pk": self.contribution1.id})
        res = self.client.post(url)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res.data["has_upvoted"])
        self.assertEqual(res.data["upvotes_count"], 1)

        # Toggle upvote off
        res2 = self.client.post(url)
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertFalse(res2.data["has_upvoted"])
        self.assertEqual(res2.data["upvotes_count"], 0)
