from django.urls import path
from .views import (
    ResourceListView,
    ResourceDetailView,
    ResourceStatsView,
    BookmarkListCreateView,
    BookmarkDetailView,
    BookmarkToggleView,
)

urlpatterns = [
    path("", ResourceListView.as_view(), name="resources-list"),
    path("<int:pk>/", ResourceDetailView.as_view(), name="resource-detail"),
    path("stats/", ResourceStatsView.as_view(), name="resources-stats"),
    path("bookmarks/", BookmarkListCreateView.as_view(), name="bookmarks-list-create"),
    path("bookmarks/<int:pk>/", BookmarkDetailView.as_view(), name="bookmark-detail"),
    path("toggle-bookmark/", BookmarkToggleView.as_view(), name="toggle-bookmark"),
]
