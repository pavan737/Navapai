from django.urls import path
from .views import (
    PublicDomainListView,
    PublicDomainDetailView,
    DomainCurriculumTopicsListView,
    PlatformStatsView,
    PublicShowcaseProjectsView,
    PublicResourcesLibraryView,
    MyDomainsListCreateView,
    MyDomainDetailUpdateView,
    JoinCommunityDomainView,
    MyLearningPlansListCreateView,
    MyLearningPlanDetailUpdateView,
    UpdateLearningPlanTopicStatusView,
    TopicSimilarityDetectionView,
    UserDomainMergeView,
    AdminCommunityDomainMergeView,
    DomainMergeLogListView,
    AdminAuditLogListView,
)

urlpatterns = [
    # Public Domain Catalog
    path("", PublicDomainListView.as_view(), name="domain-list"),
    path("stats/", PlatformStatsView.as_view(), name="platform-stats"),
    path("showcase/projects/", PublicShowcaseProjectsView.as_view(), name="public-projects"),
    path("showcase/resources/", PublicResourcesLibraryView.as_view(), name="public-resources"),
    
    # Phase 4 & 5: User Domains & Enrollments
    path("my/", MyDomainsListCreateView.as_view(), name="my-domains"),
    path("my/<int:pk>/", MyDomainDetailUpdateView.as_view(), name="my-domain-detail"),
    path("my/<int:pk>/merge/", UserDomainMergeView.as_view(), name="my-domain-merge"),
    path("<int:domain_id>/join/", JoinCommunityDomainView.as_view(), name="join-domain"),

    # Phase 6: Learning Plans & Curriculum Roadmaps
    path("my/plans/", MyLearningPlansListCreateView.as_view(), name="my-learning-plans"),
    path("my/plans/<int:pk>/", MyLearningPlanDetailUpdateView.as_view(), name="my-learning-plan-detail"),
    path("my/plans/<int:plan_id>/topics/<int:topic_id>/", UpdateLearningPlanTopicStatusView.as_view(), name="update-plan-topic-status"),

    # Phase 5: Trigram Similarity Detection & Admin Merges
    path("similarity/", TopicSimilarityDetectionView.as_view(), name="topic-similarity"),
    path("admin/merge/", AdminCommunityDomainMergeView.as_view(), name="admin-community-merge"),
    path("admin/merge-logs/", DomainMergeLogListView.as_view(), name="admin-merge-logs"),
    path("admin/audit-logs/", AdminAuditLogListView.as_view(), name="admin-audit-logs"),

    # Slug lookups (kept at bottom)
    path("<slug:slug>/curriculum/", DomainCurriculumTopicsListView.as_view(), name="domain-curriculum"),
    path("<slug:slug>/", PublicDomainDetailView.as_view(), name="domain-detail"),
]
