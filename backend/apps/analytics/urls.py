from django.urls import path
from .views import (
    DeveloperDashboardAnalyticsView,
    ActivityHeatmapView,
    PublicDeveloperHeatmapView,
)

urlpatterns = [
    path("dashboard/", DeveloperDashboardAnalyticsView.as_view(), name="dashboard-analytics"),
    path("heatmap/", ActivityHeatmapView.as_view(), name="activity-heatmap"),
    path("public/<str:username>/", PublicDeveloperHeatmapView.as_view(), name="public-developer-heatmap"),
]
