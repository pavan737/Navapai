from django.urls import path
from .views import (
    WeeklyNoteListView,
    DeveloperNoteDetailView,
    DeveloperNoteTogglePinView,
    PublicDeveloperNotesListView,
    DeveloperNoteStatsView,
)

urlpatterns = [
    path("my/", WeeklyNoteListView.as_view(), name="my-notes-list-create"),
    path("my/<int:pk>/", DeveloperNoteDetailView.as_view(), name="my-note-detail"),
    path("my/<int:pk>/pin/", DeveloperNoteTogglePinView.as_view(), name="note-toggle-pin"),
    path("public/", PublicDeveloperNotesListView.as_view(), name="public-notes-list"),
    path("stats/", DeveloperNoteStatsView.as_view(), name="notes-stats"),
]
