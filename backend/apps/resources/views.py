from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q, Count
from django.shortcuts import get_object_or_404
from .models import Resource, Bookmark
from .serializers import ResourceSerializer, BookmarkSerializer


class ResourceListView(generics.ListAPIView):
    """
    Public listing of curated learning resources with search and filtering.
    """
    serializer_class = ResourceSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        queryset = Resource.objects.all()

        category = self.request.query_params.get("category")
        if category and category.lower() != "all":
            queryset = queryset.filter(category__iexact=category)

        resource_type = self.request.query_params.get("type")
        if resource_type and resource_type.lower() != "all":
            queryset = queryset.filter(resource_type__iexact=resource_type)

        difficulty = self.request.query_params.get("difficulty")
        if difficulty and difficulty.lower() != "all":
            queryset = queryset.filter(difficulty__iexact=difficulty)

        featured = self.request.query_params.get("featured")
        if featured and featured.lower() in ("true", "1"):
            queryset = queryset.filter(is_featured=True)

        search = self.request.query_params.get("search")
        if search:
            q = search.strip()
            queryset = queryset.filter(
                Q(title__icontains=q)
                | Q(description__icontains=q)
                | Q(author_or_creator__icontains=q)
                | Q(category__icontains=q)
            )

        return queryset.order_by("-is_featured", "-created_at")


class ResourceDetailView(generics.RetrieveAPIView):
    """
    Retrieve single resource.
    """
    serializer_class = ResourceSerializer
    permission_classes = [AllowAny]
    queryset = Resource.objects.all()


class ResourceStatsView(APIView):
    """
    Returns total resources and available categories.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        categories = list(
            Resource.objects.values_list("category", flat=True)
            .distinct()
            .order_by("category")
        )
        types = list(
            Resource.objects.values_list("resource_type", flat=True)
            .distinct()
            .order_by("resource_type")
        )
        return Response(
            {
                "total_resources": Resource.objects.count(),
                "categories": categories,
                "types": types,
            },
            status=status.HTTP_200_OK,
        )


class BookmarkListCreateView(generics.ListCreateAPIView):
    """
    List or create personal bookmarks owned by request.user.
    """
    serializer_class = BookmarkSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Bookmark.objects.filter(user=self.request.user).select_related("resource")


class BookmarkToggleView(APIView):
    """
    1-Click toggle bookmark endpoint for a resource_id.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        resource_id = request.data.get("resource_id")
        if not resource_id:
            return Response({"error": "resource_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        resource = get_object_or_404(Resource, id=resource_id)
        bookmark = Bookmark.objects.filter(user=request.user, resource=resource).first()

        if bookmark:
            bookmark.delete()
            return Response({
                "message": f"Removed '{resource.title}' from bookmarks.",
                "is_bookmarked": False,
            }, status=status.HTTP_200_OK)
        else:
            new_bookmark = Bookmark.objects.create(user=request.user, resource=resource)
            serializer = BookmarkSerializer(new_bookmark, context={"request": request})
            return Response({
                "message": f"Added '{resource.title}' to bookmarks.",
                "is_bookmarked": True,
                "bookmark": serializer.data,
            }, status=status.HTTP_201_CREATED)


class BookmarkDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a personal bookmark.
    """
    serializer_class = BookmarkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Bookmark.objects.filter(user=self.request.user).select_related("resource")
