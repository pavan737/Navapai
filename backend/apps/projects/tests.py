from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User
from apps.domains.models import CommunityDomain, UserDomain
from .models import Project
from .services import GitHubSyncService


class ProjectsApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create Users
        self.user1 = User.objects.create_user(
            email="dev1@navapai.org",
            username="developer_one",
            password="DevPassword2026!",
        )
        self.user2 = User.objects.create_user(
            email="dev2@navapai.org",
            username="developer_two",
            password="DevPassword2026!",
        )

        # Create Community Domain & UserDomain
        self.domain_python = CommunityDomain.objects.create(
            title="Python",
            slug="python",
            category="Programming & Languages",
            is_approved=True,
            is_public=True,
        )
        self.user_domain = UserDomain.objects.create(
            user=self.user1,
            community_domain=self.domain_python,
            original_name="Python",
            joined_via=UserDomain.JoinedVia.ENROLLED,
        )

        # Create Sample Project
        self.project1 = Project.objects.create(
            user=self.user1,
            user_domain=self.user_domain,
            community_domain=self.domain_python,
            title="Distributed Task Queue",
            tagline="Scalable celery-like task orchestrator",
            description="Built using Python asyncio and Redis streams.",
            github_url="https://github.com/django/django",
            primary_language="Python",
            technologies=["Python", "Redis", "Docker"],
            visibility=Project.Visibility.PUBLIC,
            is_showcase=True,
            github_stars_count=150,
        )

    def test_public_showcase_projects_endpoint(self):
        url = reverse("showcase-projects")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data.get("results", res.data)
        self.assertGreaterEqual(len(results), 1)
        self.assertEqual(results[0]["title"], "Distributed Task Queue")
        self.assertEqual(results[0]["user_username"], "developer_one")

    def test_create_project_and_domain_linkage(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse("my-projects-list-create")
        res = self.client.post(url, {
            "title": "FastAPI Microservices Blueprint",
            "tagline": "Modern asynchronous API template",
            "description": "Production setup with PostgreSQL and Docker Compose.",
            "github_url": "https://github.com/tiangolo/fastapi",
            "primary_language": "Python",
            "technologies": ["FastAPI", "Python", "PostgreSQL"],
            "user_domain": self.user_domain.id,
            "visibility": "PUBLIC",
            "auto_sync_github": False,
        }, format="json")

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["title"], "FastAPI Microservices Blueprint")
        self.assertEqual(res.data["user_domain"], self.user_domain.id)

    def test_github_preview_metadata_endpoint(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse("github-preview-metadata")
        res = self.client.post(url, {
            "github_url": "https://github.com/django/django",
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["owner"], "django")
        self.assertEqual(res.data["repo_name"], "django")

    def test_project_data_isolation(self):
        # User 2 cannot modify or delete User 1's project
        self.client.force_authenticate(user=self.user2)
        url = reverse("my-project-detail", kwargs={"pk": self.project1.id})
        
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

        res_patch = self.client.patch(url, {"title": "Hacked Title"})
        self.assertEqual(res_patch.status_code, status.HTTP_404_NOT_FOUND)

    def test_github_user_repos_endpoint(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse("github-user-repos") + "?username=octocat"
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("repositories", res.data)
        self.assertGreaterEqual(res.data["count"], 1)

    def test_public_developer_portfolio_endpoint(self):
        url = reverse("public-developer-portfolio", kwargs={"username": self.user1.username})
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["developer"]["username"], self.user1.username)
        self.assertGreaterEqual(len(res.data["projects"]), 1)

