from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User
from apps.domains.models import CommunityDomain, UserDomain
from .models import AchievementBadge, UserAchievement


class GamificationApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="gamedev@navapai.org",
            username="game_dev",
            password="DevPassword2026!",
        )

        self.badge = AchievementBadge.objects.create(
            slug="first-step",
            name="First Step",
            description="Enrolled in your first learning domain workspace.",
            icon_name="Compass",
            category="LEARNING",
            points_reward=50,
        )

    def test_list_badges_public(self):
        url = reverse("badges-list")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data if isinstance(res.data, list) else res.data.get("results", [])
        self.assertGreaterEqual(len(results), 1)

    def test_auto_unlock_badge_and_xp(self):
        # Create domain for user to satisfy first-step criteria
        cd = CommunityDomain.objects.create(title="Kubernetes", slug="k8s", is_approved=True, is_public=True)
        UserDomain.objects.create(user=self.user, community_domain=cd, original_name="Kubernetes")

        self.client.force_authenticate(user=self.user)
        url = reverse("my-achievements")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(res.data["unlocked_badges_count"], 1)
        self.assertGreaterEqual(res.data["level_info"]["total_xp"], 80) # 50 badge XP + 30 domain XP

    def test_leaderboard(self):
        url = reverse("leaderboard")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data if isinstance(res.data, list) else res.data.get("results", [])
        self.assertGreaterEqual(len(results), 1)
        self.assertEqual(results[0]["username"], "game_dev")
