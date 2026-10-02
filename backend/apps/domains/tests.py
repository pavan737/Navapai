from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User
from .models import (
    CommunityDomain,
    DomainAlias,
    CurriculumTopic,
    TopicMilestone,
    UserDomain,
    LearningPlan,
    LearningPlanTopic,
    DomainMergeLog,
    AdminAuditLog,
)


class PublicDomainApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create sample approved public domains
        self.domain_python = CommunityDomain.objects.create(
            title="Python",
            slug="python",
            category="Programming & Languages",
            description="Python programming language.",
            is_featured=True,
            is_approved=True,
            is_public=True,
            status=CommunityDomain.Status.APPROVED,
        )
        DomainAlias.objects.create(
            domain=self.domain_python,
            alias="Python Development",
        )

        # Create sample curriculum topics for Python
        self.topic1 = CurriculumTopic.objects.create(
            domain=self.domain_python,
            title="Python Internals & Execution Model",
            slug="python-internals",
            difficulty="BEGINNER",
            order=1,
            estimated_hours=4,
        )
        self.topic2 = CurriculumTopic.objects.create(
            domain=self.domain_python,
            title="AsyncIO Concurrency & TaskGroups",
            slug="asyncio-concurrency",
            difficulty="ADVANCED",
            order=2,
            estimated_hours=8,
        )

        self.domain_aws = CommunityDomain.objects.create(
            title="AWS",
            slug="aws",
            category="Cloud Infrastructure",
            description="Amazon Web Services cloud computing.",
            is_featured=True,
            is_approved=True,
            is_public=True,
            status=CommunityDomain.Status.APPROVED,
        )

        # Unapproved / private domain
        self.unapproved_domain = CommunityDomain.objects.create(
            title="Secret Draft Domain",
            slug="secret-draft",
            category="Internal",
            is_approved=False,
            is_public=False,
            status=CommunityDomain.Status.PENDING,
        )

        # Create Admin User
        self.admin_user = User.objects.create_superuser(
            email="admin_tester@navapai.org",
            username="admin_tester",
            password="AdminTestPass2026!",
        )

        # Create Normal User 1
        self.user1 = User.objects.create_user(
            email="learner1@navapai.org",
            username="learner_one",
            password="LearnerTestPass2026!",
        )

        # Create Normal User 2
        self.user2 = User.objects.create_user(
            email="learner2@navapai.org",
            username="learner_two",
            password="LearnerTestPass2026!",
        )

    def test_public_domain_list_filters_approved_only(self):
        response = self.client.get(reverse("domain-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results", response.data)
        slugs = [d["slug"] for d in results]
        self.assertIn("python", slugs)
        self.assertIn("aws", slugs)
        self.assertNotIn("secret-draft", slugs)

    def test_domain_search_by_alias(self):
        response = self.client.get(reverse("domain-list") + "?search=Development")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results", response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["slug"], "python")

    def test_domain_filter_by_category(self):
        response = self.client.get(reverse("domain-list") + "?category=Cloud%20Infrastructure")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results", response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["slug"], "aws")

    def test_domain_detail_by_slug(self):
        response = self.client.get(reverse("domain-detail", kwargs={"slug": "python"}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Python")
        self.assertEqual(response.data["category"], "Programming & Languages")

    def test_platform_stats_endpoint(self):
        response = self.client.get(reverse("platform-stats"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("total_domains", response.data)
        self.assertIn("active_learners", response.data)
        self.assertEqual(response.data["total_domains"], 2)

    def test_showcase_projects_endpoint(self):
        response = self.client.get(reverse("public-projects"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_resources_library_endpoint(self):
        response = self.client.get(reverse("public-resources"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_admin_merge_logs_permission_check(self):
        DomainMergeLog.objects.create(
            source_domain="Python Development",
            target_domain=self.domain_python,
            requested_by=self.user1,
            approved_by=self.admin_user,
            similarity_score=0.94,
            reason="High trigram match on title and aliases",
        )

        url = reverse("admin-merge-logs")
        res = self.client.get(url)
        self.assertIn(res.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

        self.client.force_authenticate(user=self.user1)
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user=self.admin_user)
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data.get("results", res.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["source_domain"], "Python Development")
        self.assertEqual(results[0]["target_domain_title"], "Python")

    def test_admin_audit_logs_permission_check(self):
        AdminAuditLog.objects.create(
            user=self.admin_user,
            action="DOMAIN_APPROVED",
            target_model="domains.CommunityDomain",
            target_id=str(self.domain_python.id),
            details={"title": "Python"},
        )

        url = reverse("admin-audit-logs")
        self.client.force_authenticate(user=self.user1)
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user=self.admin_user)
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data.get("results", res.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["action"], "DOMAIN_APPROVED")

    # ==========================================
    # PHASE 4: USER DOMAIN TESTS
    # ==========================================

    def test_join_community_domain_workflow(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse("join-domain", kwargs={"domain_id": self.domain_aws.id})
        
        res = self.client.post(url)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["user_domain"]["original_name"], "AWS")
        
        self.domain_aws.refresh_from_db()
        self.assertEqual(self.domain_aws.members_count, 1)

        res_repeat = self.client.post(url)
        self.assertEqual(res_repeat.status_code, status.HTTP_200_OK)

    def test_user_domain_data_isolation(self):
        ud1 = UserDomain.objects.create(
            user=self.user1,
            original_name="My Private Machine Learning",
            original_description="Personal notes and ML roadmap",
            joined_via=UserDomain.JoinedVia.CREATED,
            visibility=UserDomain.Visibility.PRIVATE,
        )

        ud2 = UserDomain.objects.create(
            user=self.user2,
            original_name="User 2 Kubernetes Cluster",
            joined_via=UserDomain.JoinedVia.CREATED,
        )

        self.client.force_authenticate(user=self.user1)
        res = self.client.get(reverse("my-domains"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data.get("results", res.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["original_name"], "My Private Machine Learning")

        detail_url = reverse("my-domain-detail", kwargs={"pk": ud2.id})
        res_detail = self.client.get(detail_url)
        self.assertEqual(res_detail.status_code, status.HTTP_404_NOT_FOUND)

    # ===================================================
    # PHASE 5: SIMILARITY DETECTION & DOMAIN MERGE TESTS
    # ===================================================

    def test_similarity_detection_exact_and_alias_matches(self):
        res_exact = self.client.post(reverse("topic-similarity"), {"query": "Python"})
        self.assertEqual(res_exact.status_code, status.HTTP_200_OK)
        self.assertTrue(res_exact.data["has_matches"])
        self.assertEqual(res_exact.data["top_match"]["similarity_score"], 1.0)
        self.assertEqual(res_exact.data["top_match"]["domain_id"], self.domain_python.id)

        res_alias = self.client.post(reverse("topic-similarity"), {"query": "Python Development"})
        self.assertEqual(res_alias.status_code, status.HTTP_200_OK)
        self.assertTrue(res_alias.data["has_matches"])
        self.assertGreaterEqual(res_alias.data["top_match"]["similarity_score"], 0.95)
        self.assertEqual(res_alias.data["top_match"]["domain_id"], self.domain_python.id)

    def test_user_domain_merge_preserves_original_name(self):
        ud = UserDomain.objects.create(
            user=self.user1,
            original_name="Python Backend Mastery",
            joined_via=UserDomain.JoinedVia.CREATED,
        )

        self.client.force_authenticate(user=self.user1)
        merge_url = reverse("my-domain-merge", kwargs={"pk": ud.id})
        res = self.client.post(merge_url, {
            "target_domain_id": self.domain_python.id,
            "reason": "Matching to canonical Python domain",
        })

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        
        ud.refresh_from_db()
        self.assertEqual(ud.original_name, "Python Backend Mastery")
        self.assertEqual(ud.community_domain_id, self.domain_python.id)
        self.assertEqual(ud.joined_via, UserDomain.JoinedVia.MERGED)
        self.assertTrue(DomainMergeLog.objects.filter(source_domain="Python Backend Mastery", target_domain=self.domain_python).exists())

    def test_admin_community_domain_merge_workflow(self):
        domain_django = CommunityDomain.objects.create(
            title="Django Framework",
            slug="django-framework",
            category="Web Frameworks",
            is_approved=True,
            is_public=True,
        )

        ud = UserDomain.objects.create(
            user=self.user1,
            community_domain=domain_django,
            original_name="Django Web Development",
            joined_via=UserDomain.JoinedVia.ENROLLED,
        )

        self.client.force_authenticate(user=self.admin_user)
        admin_merge_url = reverse("admin-community-merge")
        res = self.client.post(admin_merge_url, {
            "source_domain_id": domain_django.id,
            "target_domain_id": self.domain_python.id,
            "reason": "Merge Django Framework into Python canonical tree",
        })

        self.assertEqual(res.status_code, status.HTTP_200_OK)

        domain_django.refresh_from_db()
        self.assertEqual(domain_django.status, CommunityDomain.Status.ARCHIVED)
        self.assertFalse(domain_django.is_public)

        ud.refresh_from_db()
        self.assertEqual(ud.community_domain_id, self.domain_python.id)
        self.assertEqual(ud.original_name, "Django Web Development")

    # ===================================================
    # PHASE 6: CURRICULUM & LEARNING PLANS TESTS
    # ===================================================

    def test_domain_curriculum_endpoint(self):
        url = reverse("domain-curriculum", kwargs={"slug": "python"})
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data.get("results", res.data)
        self.assertEqual(len(results), 2)
        self.assertEqual(results[0]["title"], "Python Internals & Execution Model")
        self.assertEqual(results[1]["title"], "AsyncIO Concurrency & TaskGroups")

    def test_learning_plan_creation_and_auto_populate(self):
        ud = UserDomain.objects.create(
            user=self.user1,
            community_domain=self.domain_python,
            original_name="Python",
            joined_via=UserDomain.JoinedVia.ENROLLED,
        )

        self.client.force_authenticate(user=self.user1)
        res = self.client.post(reverse("my-learning-plans"), {
            "user_domain": ud.id,
            "title": "Python 2026 Mastery",
            "auto_populate_topics": True,
        })

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        plan_id = res.data["id"]
        
        # Verify LearningPlan has 2 auto-populated topics
        plan = LearningPlan.objects.get(id=plan_id)
        self.assertEqual(plan.total_topics, 2)
        self.assertEqual(plan.completed_topics, 0)
        self.assertEqual(plan.progress_percentage, 0)

    def test_update_plan_topic_status_and_progress_sync(self):
        ud = UserDomain.objects.create(
            user=self.user1,
            community_domain=self.domain_python,
            original_name="Python",
            joined_via=UserDomain.JoinedVia.ENROLLED,
        )

        plan = LearningPlan.objects.create(
            user=self.user1,
            user_domain=ud,
            title="Python Study Plan",
        )

        lpt1 = LearningPlanTopic.objects.create(plan=plan, topic=self.topic1, order=1)
        lpt2 = LearningPlanTopic.objects.create(plan=plan, topic=self.topic2, order=2)

        self.client.force_authenticate(user=self.user1)
        update_url = reverse("update-plan-topic-status", kwargs={"plan_id": plan.id, "topic_id": lpt1.id})
        
        res = self.client.patch(update_url, {
            "status": "COMPLETED",
            "notes": "Mastered CPython execution cycle and bytecode compilation.",
        })

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        
        # Verify plan progress is 50%
        plan.refresh_from_db()
        self.assertEqual(plan.progress_percentage, 50)
        self.assertEqual(plan.completed_topics, 1)

        # Verify UserDomain progress synced to 50%
        ud.refresh_from_db()
        self.assertEqual(ud.progress, 50)
