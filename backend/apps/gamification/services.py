from django.db.models import Sum
from apps.domains.models import UserDomain, LearningPlan
from apps.projects.models import Project
from apps.tasks.models import WeeklyTask
from apps.notes.models import DeveloperNote
from apps.resources.models import Bookmark
from apps.career.models import Certification
from .models import AchievementBadge, UserAchievement


class GamificationService:
    """
    Service for checking, unlocking developer achievement badges, and calculating Developer XP & Level.
    """
    @staticmethod
    def get_developer_level_info(total_xp: int) -> dict:
        level = 1 + int(total_xp / 200)
        xp_in_current_level = total_xp % 200
        progress_percentage = int((xp_in_current_level / 200) * 100)

        if level >= 10:
            title = "Principal Solutions Architect"
        elif level >= 7:
            title = "Senior Cloud Engineer"
        elif level >= 5:
            title = "Full Stack Engineer"
        elif level >= 3:
            title = "Associate Developer"
        else:
            title = "Junior Explorer"

        return {
            "level": level,
            "title": title,
            "total_xp": total_xp,
            "xp_in_current_level": xp_in_current_level,
            "xp_for_next_level": 200,
            "progress_percentage": progress_percentage,
        }

    @classmethod
    def calculate_user_xp(cls, user) -> int:
        badge_xp = (
            UserAchievement.objects.filter(user=user).aggregate(
                Sum("badge__points_reward")
            )["badge__points_reward__sum"]
            or 0
        )

        # Base Activity Bonuses
        domain_xp = UserDomain.objects.filter(user=user).count() * 30
        project_xp = Project.objects.filter(user=user).count() * 50
        task_xp = WeeklyTask.objects.filter(user=user, status=WeeklyTask.Status.COMPLETED).count() * 20
        note_xp = DeveloperNote.objects.filter(user=user).count() * 15
        cert_xp = Certification.objects.filter(user=user).count() * 100

        return badge_xp + domain_xp + project_xp + task_xp + note_xp + cert_xp

    @classmethod
    def evaluate_and_unlock_badges(cls, user) -> list:
        """
        Evaluates user platform activities and unlocks qualifying badges automatically.
        Returns list of newly unlocked UserAchievement objects.
        """
        unlocked_new = []
        user_badge_ids = set(
            UserAchievement.objects.filter(user=user).values_list("badge_id", flat=True)
        )

        # Metrics
        domains_count = UserDomain.objects.filter(user=user).count()
        projects_count = Project.objects.filter(user=user).count()
        completed_tasks_count = WeeklyTask.objects.filter(user=user, status=WeeklyTask.Status.COMPLETED).count()
        notes_count = DeveloperNote.objects.filter(user=user).count()
        bookmarks_count = Bookmark.objects.filter(user=user).count()
        certs_count = Certification.objects.filter(user=user).count()

        badge_criteria = [
            ("first-step", domains_count >= 1),
            ("domain-pioneer", domains_count >= 3),
            ("project-builder", projects_count >= 1),
            ("master-architect", projects_count >= 3),
            ("task-master", completed_tasks_count >= 5),
            ("knowledge-scholar", notes_count >= 3),
            ("resource-curator", bookmarks_count >= 3),
            ("cert-collector", certs_count >= 1),
        ]

        for slug, qualifies in badge_criteria:
            if qualifies:
                badge = AchievementBadge.objects.filter(slug=slug).first()
                if badge and badge.id not in user_badge_ids:
                    ua, created = UserAchievement.objects.get_or_create(user=user, badge=badge)
                    if created:
                        unlocked_new.append(ua)

        return unlocked_new
