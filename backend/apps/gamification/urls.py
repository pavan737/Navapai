from django.urls import path
from .views import (
    BadgeListView,
    UserAchievementsView,
    CheckAchievementsView,
    LeaderboardView,
)

urlpatterns = [
    path("badges/", BadgeListView.as_view(), name="badges-list"),
    path("my-achievements/", UserAchievementsView.as_view(), name="my-achievements"),
    path("check-achievements/", CheckAchievementsView.as_view(), name="check-achievements"),
    path("leaderboard/", LeaderboardView.as_view(), name="leaderboard"),
]
