from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from apps.accounts.models import User
from .models import AchievementBadge, UserAchievement
from .serializers import (
    AchievementBadgeSerializer,
    UserAchievementSerializer,
    LeaderboardUserSerializer,
)
from .services import GamificationService


class BadgeListView(generics.ListAPIView):
    """
    List all available achievement badges with user unlock status.
    """
    serializer_class = AchievementBadgeSerializer
    permission_classes = [AllowAny]
    queryset = AchievementBadge.objects.all()
    pagination_class = None


class UserAchievementsView(APIView):
    """
    Get authenticated user's unlocked badges, total XP, and developer level info.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Auto evaluate before returning
        GamificationService.evaluate_and_unlock_badges(request.user)

        user_achievements = UserAchievement.objects.filter(user=request.user).select_related("badge")
        total_xp = GamificationService.calculate_user_xp(request.user)
        level_info = GamificationService.get_developer_level_info(total_xp)

        serializer = UserAchievementSerializer(user_achievements, many=True)
        return Response({
            "user_id": request.user.id,
            "username": request.user.username,
            "level_info": level_info,
            "unlocked_badges_count": user_achievements.count(),
            "achievements": serializer.data,
        }, status=status.HTTP_200_OK)


class CheckAchievementsView(APIView):
    """
    Trigger manual check to unlock qualifying badges.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        newly_unlocked = GamificationService.evaluate_and_unlock_badges(request.user)
        serializer = UserAchievementSerializer(newly_unlocked, many=True)
        return Response({
            "message": f"Unlocked {len(newly_unlocked)} new achievement badge(s)!",
            "newly_unlocked": serializer.data,
        }, status=status.HTTP_200_OK)


class LeaderboardView(APIView):
    """
    Public Developer Gamification Leaderboard.
    Ranks top developers by total XP.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        users = User.objects.filter(is_active=True)
        serialized_users = LeaderboardUserSerializer(users, many=True).data

        # Sort by total_xp descending
        sorted_leaderboard = sorted(
            serialized_users, key=lambda x: x["total_xp"], reverse=True
        )

        # Add rank
        for idx, u in enumerate(sorted_leaderboard, start=1):
            u["rank"] = idx

        return Response(sorted_leaderboard[:50], status=status.HTTP_200_OK)
