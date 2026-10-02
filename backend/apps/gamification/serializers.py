from rest_framework import serializers
from apps.accounts.models import User
from .models import AchievementBadge, UserAchievement
from .services import GamificationService


class AchievementBadgeSerializer(serializers.ModelSerializer):
    is_unlocked = serializers.SerializerMethodField()
    unlocked_at = serializers.SerializerMethodField()

    class Meta:
        model = AchievementBadge
        fields = [
            "id",
            "slug",
            "name",
            "description",
            "icon_name",
            "category",
            "points_reward",
            "is_unlocked",
            "unlocked_at",
        ]

    def get_is_unlocked(self, obj) -> bool:
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return UserAchievement.objects.filter(user=request.user, badge=obj).exists()
        return False

    def get_unlocked_at(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            ua = UserAchievement.objects.filter(user=request.user, badge=obj).first()
            return ua.unlocked_at if ua else None
        return None


class UserAchievementSerializer(serializers.ModelSerializer):
    badge = AchievementBadgeSerializer(read_only=True)

    class Meta:
        model = UserAchievement
        fields = ["id", "badge", "unlocked_at"]


class LeaderboardUserSerializer(serializers.ModelSerializer):
    total_xp = serializers.SerializerMethodField()
    level_info = serializers.SerializerMethodField()
    unlocked_badges_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "total_xp",
            "level_info",
            "unlocked_badges_count",
            "date_joined",
        ]

    def get_total_xp(self, obj) -> int:
        return GamificationService.calculate_user_xp(obj)

    def get_level_info(self, obj) -> dict:
        total_xp = self.get_total_xp(obj)
        return GamificationService.get_developer_level_info(total_xp)

    def get_unlocked_badges_count(self, obj) -> int:
        return UserAchievement.objects.filter(user=obj).count()
