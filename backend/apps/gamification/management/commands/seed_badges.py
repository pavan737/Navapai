from django.core.management.base import BaseCommand
from apps.gamification.models import AchievementBadge


class Command(BaseCommand):
    help = "Seeds default developer achievement badges (Phase 12)."

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding developer achievement badges...")

        badges_data = [
            {
                "slug": "first-step",
                "name": "First Step",
                "description": "Enrolled in your first learning domain workspace on Navapai.",
                "icon_name": "Compass",
                "category": AchievementBadge.Category.LEARNING,
                "points_reward": 50,
            },
            {
                "slug": "domain-pioneer",
                "name": "Domain Pioneer",
                "description": "Enrolled in 3 or more technical learning domains.",
                "icon_name": "Layers",
                "category": AchievementBadge.Category.LEARNING,
                "points_reward": 100,
            },
            {
                "slug": "project-builder",
                "name": "Project Builder",
                "description": "Created or imported your first real-world developer project.",
                "icon_name": "Code",
                "category": AchievementBadge.Category.PROJECTS,
                "points_reward": 75,
            },
            {
                "slug": "master-architect",
                "name": "Master Architect",
                "description": "Built 3 or more portfolio engineering projects.",
                "icon_name": "Sparkles",
                "category": AchievementBadge.Category.PROJECTS,
                "points_reward": 150,
            },
            {
                "slug": "task-master",
                "name": "Task Master",
                "description": "Completed 5 or more weekly developer tasks.",
                "icon_name": "CheckSquare",
                "category": AchievementBadge.Category.TASKS,
                "points_reward": 100,
            },
            {
                "slug": "knowledge-scholar",
                "name": "Knowledge Scholar",
                "description": "Wrote 3 or more technical markdown notes & code snippets.",
                "icon_name": "BookOpen",
                "category": AchievementBadge.Category.NOTES,
                "points_reward": 75,
            },
            {
                "slug": "resource-curator",
                "name": "Resource Curator",
                "description": "Saved 3 or more learning resources in personal bookmarks.",
                "icon_name": "Bookmark",
                "category": AchievementBadge.Category.RESOURCES,
                "points_reward": 50,
            },
            {
                "slug": "cert-collector",
                "name": "Certification Collector",
                "description": "Added your first verified industry certification badge.",
                "icon_name": "Award",
                "category": AchievementBadge.Category.CAREER,
                "points_reward": 150,
            },
            {
                "slug": "cloud-architect",
                "name": "Cloud Specialist",
                "description": "Achieved Level 5 Developer status on Navapai.",
                "icon_name": "ShieldCheck",
                "category": AchievementBadge.Category.COMMUNITY,
                "points_reward": 200,
            },
        ]

        count = 0
        for item in badges_data:
            badge, created = AchievementBadge.objects.get_or_create(
                slug=item["slug"],
                defaults=item,
            )
            if created:
                count += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {count} achievement badges."))
