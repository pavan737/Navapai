from django.urls import path
from .views import (
    PublicContributionListView,
    MyContributionListCreateView,
    ContributionDetailView,
    ContributionUpvoteView,
    ModerationQueueView,
    ModerationReviewView,
)

urlpatterns = [
    path("", PublicContributionListView.as_view(), name="community-list"),
    path("my/", MyContributionListCreateView.as_view(), name="my-contributions-list-create"),
    path("my/<int:pk>/", ContributionDetailView.as_view(), name="my-contribution-detail"),
    path("<int:pk>/upvote/", ContributionUpvoteView.as_view(), name="contribution-upvote"),
    path("moderation/", ModerationQueueView.as_view(), name="moderation-queue"),
    path("moderation/<int:pk>/review/", ModerationReviewView.as_view(), name="moderation-review"),
]
