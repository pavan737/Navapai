from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Q, Count
from apps.domains.models import UserDomain
from apps.projects.models import Project
from apps.tasks.models import WeeklyTask
from apps.notes.models import DeveloperNote
from apps.career.models import Certification, CareerMilestone
from apps.gamification.services import GamificationService


class AnalyticsService:
    """
    Service for computing developer productivity analytics, 365-day activity heatmaps, and skill radar stats (Phase 14).
    """
    @classmethod
    def get_365_day_heatmap(cls, user) -> list:
        today = timezone.now().date()
        start_date = today - timedelta(days=364)

        # Gather activity timestamps
        tasks_dates = WeeklyTask.objects.filter(
            user=user, status=WeeklyTask.Status.COMPLETED, completed_at__isnull=False
        ).values_list("completed_at", flat=True)

        notes_dates = DeveloperNote.objects.filter(user=user).values_list("created_at", flat=True)
        projects_dates = Project.objects.filter(user=user).values_list("updated_at", flat=True)
        domains_dates = UserDomain.objects.filter(user=user).values_list("created_at", flat=True)
        certs_dates = Certification.objects.filter(user=user).values_list("created_at", flat=True)

        # Daily count map
        activity_map = {}

        def record_dates(dates_list):
            for dt in dates_list:
                if dt:
                    d_str = dt.date().isoformat()
                    activity_map[d_str] = activity_map.get(d_str, 0) + 1

        record_dates(tasks_dates)
        record_dates(notes_dates)
        record_dates(projects_dates)
        record_dates(domains_dates)
        record_dates(certs_dates)

        # Build 365 days array
        matrix = []
        curr = start_date
        while curr <= today:
            d_str = curr.isoformat()
            count = activity_map.get(d_str, 0)

            # Activity intensity level (0-4)
            if count == 0:
                level = 0
            elif count <= 2:
                level = 1
            elif count <= 4:
                level = 2
            elif count <= 7:
                level = 3
            else:
                level = 4

            matrix.append({
                "date": d_str,
                "count": count,
                "level": level,
            })
            curr += timedelta(days=1)

        return matrix

    @classmethod
    def calculate_streak(cls, user) -> int:
        heatmap = cls.get_365_day_heatmap(user)
        streak = 0
        today_str = timezone.now().date().isoformat()
        yesterday_str = (timezone.now().date() - timedelta(days=1)).isoformat()

        # Reverse iterate from latest date
        reversed_matrix = list(reversed(heatmap))

        for idx, item in enumerate(reversed_matrix):
            if item["count"] > 0:
                streak += 1
            else:
                # If today has 0 activity but yesterday had activity, continue streak check
                if idx == 0 and item["date"] == today_str:
                    continue
                break

        return streak

    @classmethod
    def get_dashboard_summary(cls, user) -> dict:
        heatmap = cls.get_365_day_heatmap(user)
        total_activities = sum(item["count"] for item in heatmap)
        active_streak = cls.calculate_streak(user)

        total_xp = GamificationService.calculate_user_xp(user)
        level_info = GamificationService.get_developer_level_info(total_xp)

        # Quick counts
        enrolled_domains_count = UserDomain.objects.filter(user=user).count()
        projects_count = Project.objects.filter(user=user).count()
        completed_tasks_count = WeeklyTask.objects.filter(user=user, status=WeeklyTask.Status.COMPLETED).count()
        pending_tasks_count = WeeklyTask.objects.filter(user=user).exclude(status=WeeklyTask.Status.COMPLETED).count()
        notes_count = DeveloperNote.objects.filter(user=user).count()
        certs_count = Certification.objects.filter(user=user).count()

        return {
            "developer_username": user.username,
            "total_xp": total_xp,
            "level_info": level_info,
            "active_streak": active_streak,
            "total_activities_365": total_activities,
            "counts": {
                "enrolled_domains": enrolled_domains_count,
                "projects": projects_count,
                "completed_tasks": completed_tasks_count,
                "pending_tasks": pending_tasks_count,
                "notes": notes_count,
                "certifications": certs_count,
            },
        }
