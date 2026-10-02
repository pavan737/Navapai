from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User
from apps.domains.models import CommunityDomain, UserDomain
from apps.projects.models import Project
from .models import WeeklyTask, SubTask


class TasksApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.user1 = User.objects.create_user(
            email="taskdev1@navapai.org",
            username="taskdev_one",
            password="DevPassword2026!",
        )
        self.user2 = User.objects.create_user(
            email="taskdev2@navapai.org",
            username="taskdev_two",
            password="DevPassword2026!",
        )

        self.domain = CommunityDomain.objects.create(
            title="PostgreSQL",
            slug="postgresql",
            category="Databases",
            is_approved=True,
            is_public=True,
        )
        self.user_domain = UserDomain.objects.create(
            user=self.user1,
            community_domain=self.domain,
            original_name="PostgreSQL",
        )

        self.task1 = WeeklyTask.objects.create(
            user=self.user1,
            user_domain=self.user_domain,
            title="Implement pg_trgm trigram index",
            description="Optimize similarity queries for domain search.",
            status=WeeklyTask.Status.TODO,
            priority=WeeklyTask.Priority.HIGH,
            category=WeeklyTask.Category.CODING,
            week_number=34,
            year=2026,
            estimated_minutes=120,
        )
        self.subtask1 = SubTask.objects.create(
            task=self.task1,
            title="Write SQL migration script for GIN index",
            is_completed=False,
        )

    def test_list_tasks(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse("my-tasks-list-create")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data.get("results", res.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["title"], "Implement pg_trgm trigram index")

    def test_create_task_with_initial_subtasks(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse("my-tasks-list-create")
        res = self.client.post(url, {
            "title": "Design REST API schema for Tasks",
            "description": "Define serializers, views, and routes.",
            "priority": "HIGH",
            "category": "ARCHITECTURE",
            "week_number": 34,
            "year": 2026,
            "estimated_minutes": 90,
            "initial_subtasks": ["Create models", "Create views", "Add tests"],
        }, format="json")

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["title"], "Design REST API schema for Tasks")
        created_task = WeeklyTask.objects.get(id=res.data["id"])
        self.assertEqual(created_task.subtasks.count(), 3)

    def test_toggle_task_status(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse("task-toggle-status", kwargs={"pk": self.task1.id})
        res = self.client.post(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["task"]["status"], "COMPLETED")
        self.assertIsNotNone(res.data["task"]["completed_at"])

        # Toggle back to TODO
        res2 = self.client.post(url)
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertEqual(res2.data["task"]["status"], "TODO")

    def test_task_stats_endpoint(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse("tasks-weekly-stats") + "?week=34&year=2026"
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["total_tasks"], 1)
        self.assertEqual(res.data["todo_tasks"], 1)
        self.assertEqual(res.data["estimated_hours"], 2.0)

    def test_task_data_isolation(self):
        # User 2 cannot access or toggle User 1's task
        self.client.force_authenticate(user=self.user2)
        url = reverse("my-task-detail", kwargs={"pk": self.task1.id})
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

        toggle_url = reverse("task-toggle-status", kwargs={"pk": self.task1.id})
        res_toggle = self.client.post(toggle_url)
        self.assertEqual(res_toggle.status_code, status.HTTP_404_NOT_FOUND)
