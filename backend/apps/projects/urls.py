from django.urls import path
from .views import (
    PublicShowcaseProjectsListView,
    PublicProjectsDirectoryListView,
    MyProjectsListCreateView,
    MyProjectDetailUpdateDeleteView,
    SyncProjectGitHubView,
    GitHubPreviewMetadataView,
    GitHubUserReposView,
    PublicDeveloperPortfolioView,
    ProjectScreenshotListCreateView,
)

urlpatterns = [
    # Public Showcases, Directories & Developer Portfolios
    path("showcase/", PublicShowcaseProjectsListView.as_view(), name="showcase-projects"),
    path("public/", PublicProjectsDirectoryListView.as_view(), name="public-projects-directory"),
    path("portfolio/<str:username>/", PublicDeveloperPortfolioView.as_view(), name="public-developer-portfolio"),
    
    # Authenticated Developer Project Management & GitHub Sync
    path("my/", MyProjectsListCreateView.as_view(), name="my-projects-list-create"),
    path("my/<int:pk>/", MyProjectDetailUpdateDeleteView.as_view(), name="my-project-detail"),
    path("my/<int:pk>/sync-github/", SyncProjectGitHubView.as_view(), name="project-sync-github"),
    path("my/<int:project_id>/screenshots/", ProjectScreenshotListCreateView.as_view(), name="project-screenshots"),
    path("github/preview/", GitHubPreviewMetadataView.as_view(), name="github-preview-metadata"),
    path("github/user-repos/", GitHubUserReposView.as_view(), name="github-user-repos"),
]

