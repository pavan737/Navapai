from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User
from .models import DeveloperNote


class NotesApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="notedev@navapai.org",
            username="note_dev",
            password="DevPassword2026!",
        )

        self.note1 = DeveloperNote.objects.create(
            user=self.user,
            title="JWT Authorization Header Refresh",
            content="Detailed notes on response interceptor retry logic.",
            code_snippet="api.interceptors.response.use(res => res, async err => { ... });",
            programming_language="javascript",
            tags="jwt, auth, axios",
            is_pinned=True,
            is_public=True,
        )

    def test_list_user_notes(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("my-notes-list-create")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data.get("results", res.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["title"], "JWT Authorization Header Refresh")
        self.assertEqual(results[0]["tag_list"], ["jwt", "auth", "axios"])

    def test_create_developer_note(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("my-notes-list-create")
        res = self.client.post(url, {
            "title": "PostgreSQL Trigram Similarity Search",
            "content": "Using pg_trgm for fuzzy string search.",
            "code_snippet": "CREATE INDEX idx_trgm ON community_domains USING gin (title gin_trgm_ops);",
            "programming_language": "sql",
            "tags": "postgresql, sql, performance",
            "is_pinned": False,
            "is_public": True,
        }, format="json")

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["title"], "PostgreSQL Trigram Similarity Search")

    def test_toggle_pin_note(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("note-toggle-pin", kwargs={"pk": self.note1.id})
        res = self.client.post(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(res.data["note"]["is_pinned"])

    def test_public_notes_list(self):
        url = reverse("public-notes-list")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data.get("results", res.data)
        self.assertEqual(len(results), 1)
