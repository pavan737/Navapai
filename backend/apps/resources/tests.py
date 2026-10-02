from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User
from .models import Resource, Bookmark


class ResourcesApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="resdev@navapai.org",
            username="res_dev",
            password="DevPassword2026!",
        )

        self.resource1 = Resource.objects.create(
            title="Django Official Documentation",
            description="Reference manual for Django framework.",
            url="https://docs.djangoproject.com/",
            resource_type=Resource.Type.DOCUMENTATION,
            category="Web & Backend Frameworks",
            difficulty=Resource.Difficulty.BEGINNER,
            author_or_creator="Django Software Foundation",
            is_featured=True,
        )

    def test_list_resources_public(self):
        url = reverse("resources-list")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data if isinstance(res.data, list) else res.data.get("results", [])
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["title"], "Django Official Documentation")

    def test_toggle_bookmark(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("toggle-bookmark")
        res = self.client.post(url, {"resource_id": self.resource1.id}, format="json")

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res.data["is_bookmarked"])
        self.assertTrue(Bookmark.objects.filter(user=self.user, resource=self.resource1).exists())

        # Toggle again to remove
        res2 = self.client.post(url, {"resource_id": self.resource1.id}, format="json")
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertFalse(res2.data["is_bookmarked"])
        self.assertFalse(Bookmark.objects.filter(user=self.user, resource=self.resource1).exists())

    def test_list_user_bookmarks(self):
        self.client.force_authenticate(user=self.user)
        Bookmark.objects.create(user=self.user, resource=self.resource1, personal_notes="Essential reference!")
        url = reverse("bookmarks-list-create")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data if isinstance(res.data, list) else res.data.get("results", [])
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["resource"]["title"], "Django Official Documentation")

