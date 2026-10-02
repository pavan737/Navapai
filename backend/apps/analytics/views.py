from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from apps.accounts.models import User
from .services import AnalyticsService


class DeveloperDashboardAnalyticsView(APIView):
    """
    Get personal developer dashboard metrics & productivity summary.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        data = AnalyticsService.get_dashboard_summary(request.user)
        return Response(data, status=status.HTTP_200_OK)


class ActivityHeatmapView(APIView):
    """
    Get 365-day activity heatmap matrix for request.user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        matrix = AnalyticsService.get_365_day_heatmap(request.user)
        streak = AnalyticsService.calculate_streak(request.user)
        return Response({
            "streak": streak,
            "heatmap": matrix,
        }, status=status.HTTP_200_OK)


class PublicDeveloperHeatmapView(APIView):
    """
    Public 365-day activity heatmap matrix for developer portfolio by username.
    """
    permission_classes = [AllowAny]

    def get(self, request, username, *args, **kwargs):
        target_user = get_object_or_404(User, username__iexact=username)
        matrix = AnalyticsService.get_365_day_heatmap(target_user)
        streak = AnalyticsService.calculate_streak(target_user)
        return Response({
            "username": target_user.username,
            "streak": streak,
            "heatmap": matrix,
        }, status=status.HTTP_200_OK)
