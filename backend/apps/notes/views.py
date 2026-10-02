from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q, Count
from django.shortcuts import get_object_or_404
from .models import DeveloperNote
from .serializers import (
    DeveloperNoteListSerializer,
    DeveloperNoteDetailSerializer,
    DeveloperNoteCreateUpdateSerializer,
)


class WeeklyNoteListView(generics.ListCreateAPIView):
    """
    List or create developer notes owned by request.user.
    """
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return DeveloperNoteCreateUpdateSerializer
        return DeveloperNoteListSerializer

    def get_queryset(self):
        queryset = DeveloperNote.objects.filter(user=self.request.user).select_related(
            "user_domain", "project"
        )

        language = self.request.query_params.get("language")
        if language:
            queryset = queryset.filter(programming_language__iexact=language)

        is_pinned = self.request.query_params.get("pinned")
        if is_pinned and is_pinned.lower() in ("true", "1"):
            queryset = queryset.filter(is_pinned=True)

        user_domain = self.request.query_params.get("user_domain")
        if user_domain and user_domain.isdigit():
            queryset = queryset.filter(user_domain_id=int(user_domain))

        project = self.request.query_params.get("project")
        if project and project.isdigit():
            queryset = queryset.filter(project_id=int(project))

        tag = self.request.query_params.get("tag")
        if tag:
            queryset = queryset.filter(tags__icontains=tag)

        search = self.request.query_params.get("search")
        if search:
            q = search.strip()
            queryset = queryset.filter(
                Q(title__icontains=q)
                | Q(content__icontains=q)
                | Q(code_snippet__icontains=q)
                | Q(tags__icontains=q)
            )

        return queryset.order_by("-is_pinned", "-updated_at")


class DeveloperNoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a developer note owned by request.user.
    """
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return DeveloperNoteCreateUpdateSerializer
        return DeveloperNoteDetailSerializer

    def get_queryset(self):
        return DeveloperNote.objects.filter(user=self.request.user).select_related(
            "user_domain", "project"
        )


class DeveloperNoteTogglePinView(APIView):
    """
    1-Click toggle endpoint for note pin status.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        note = get_object_or_404(DeveloperNote, id=pk, user=request.user)
        note.is_pinned = not note.is_pinned
        note.save()
        serializer = DeveloperNoteDetailSerializer(note)
        return Response(
            {
                "message": f"Note '{note.title}' {'pinned' if note.is_pinned else 'unpinned'}.",
                "note": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class PublicDeveloperNotesListView(generics.ListAPIView):
    """
    Public community knowledge base listing public developer notes and code snippets.
    """
    serializer_class = DeveloperNoteListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = DeveloperNote.objects.filter(is_public=True).select_related(
            "user", "user_domain", "project"
        )

        language = self.request.query_params.get("language")
        if language:
            queryset = queryset.filter(programming_language__iexact=language)

        search = self.request.query_params.get("search")
        if search:
            q = search.strip()
            queryset = queryset.filter(
                Q(title__icontains=q)
                | Q(content__icontains=q)
                | Q(code_snippet__icontains=q)
                | Q(tags__icontains=q)
            )

        return queryset.order_by("-updated_at")


class DeveloperNoteStatsView(APIView):
    """
    Returns note stats and language distribution for the user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user_notes = DeveloperNote.objects.filter(user=request.user)
        total_notes = user_notes.count()
        pinned_notes = user_notes.filter(is_pinned=True).count()
        public_notes = user_notes.filter(is_public=True).count()

        lang_counts = (
            user_notes.values("programming_language")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        return Response(
            {
                "total_notes": total_notes,
                "pinned_notes": pinned_notes,
                "public_notes": public_notes,
                "language_breakdown": list(lang_counts),
            },
            status=status.HTTP_200_OK,
        )
