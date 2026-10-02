from django.urls import path
from .views import (
    CertificationListCreateView,
    CertificationDetailView,
    CareerMilestoneListCreateView,
    CareerMilestoneDetailView,
    PublicCareerTimelineView,
)

urlpatterns = [
    path("certifications/", CertificationListCreateView.as_view(), name="certifications-list-create"),
    path("certifications/<int:pk>/", CertificationDetailView.as_view(), name="certification-detail"),
    path("milestones/", CareerMilestoneListCreateView.as_view(), name="milestones-list-create"),
    path("milestones/<int:pk>/", CareerMilestoneDetailView.as_view(), name="milestone-detail"),
    path("public/<str:username>/", PublicCareerTimelineView.as_view(), name="public-career-timeline"),
]
