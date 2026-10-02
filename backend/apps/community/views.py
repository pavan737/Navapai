from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import CommunityContribution, ContributionUpvote
from .serializers import CommunityContributionSerializer, ModerationReviewSerializer


class PublicContributionListView(generics.ListAPIView):
    """
    Public listing of approved community technical contributions with search & category filtering.
    """
    serializer_class = CommunityContributionSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        queryset = CommunityContribution.objects.filter(
            status=CommunityContribution.Status.APPROVED
        ).select_related("user")

        category = self.request.query_params.get("category")
        if category and category.lower() != "all":
            queryset = queryset.filter(category__iexact=category)

        search = self.request.query_params.get("search")
        if search:
            q = search.strip()
            queryset = queryset.filter(
                Q(title__icontains=q)
                | Q(content__icontains=q)
                | Q(user__username__icontains=q)
            )

        return queryset.order_by("-upvotes_count", "-created_at")


class MyContributionListCreateView(generics.ListCreateAPIView):
    """
    List or create technical contributions owned by request.user.
    """
    serializer_class = CommunityContributionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return CommunityContribution.objects.filter(user=self.request.user).select_related("user")


class ContributionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a contribution owned by request.user.
    """
    serializer_class = CommunityContributionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CommunityContribution.objects.filter(user=self.request.user)


class ContributionUpvoteView(APIView):
    """
    1-Click upvote toggle for a community contribution.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        contribution = get_object_or_404(CommunityContribution, id=pk)
        upvote = ContributionUpvote.objects.filter(user=request.user, contribution=contribution).first()

        if upvote:
            upvote.delete()
            if contribution.upvotes_count > 0:
                contribution.upvotes_count -= 1
                contribution.save()
            return Response({
                "message": "Removed upvote.",
                "has_upvoted": False,
                "upvotes_count": contribution.upvotes_count,
            }, status=status.HTTP_200_OK)
        else:
            ContributionUpvote.objects.create(user=request.user, contribution=contribution)
            contribution.upvotes_count += 1
            contribution.save()
            return Response({
                "message": "Upvoted contribution!",
                "has_upvoted": True,
                "upvotes_count": contribution.upvotes_count,
            }, status=status.HTTP_201_CREATED)


class ModerationQueueView(generics.ListAPIView):
    """
    Staff / Admin moderation queue for reviewing pending community submissions.
    """
    serializer_class = CommunityContributionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        # Allow staff or request user to see moderation queue
        if self.request.user.is_staff or self.request.user.role in ["ADMIN", "MENTOR"]:
            return CommunityContribution.objects.all().select_related("user").order_by("status", "-created_at")
        return CommunityContribution.objects.filter(user=self.request.user)


class ModerationReviewView(APIView):
    """
    Staff review endpoint to approve or reject a contribution.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        contribution = get_object_or_404(CommunityContribution, id=pk)
        serializer = ModerationReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        contribution.status = serializer.validated_data["status"]
        contribution.review_notes = serializer.validated_data.get("review_notes", "")
        contribution.reviewed_by = request.user
        contribution.save()

        res_serializer = CommunityContributionSerializer(contribution, context={"request": request})
        return Response({
            "message": f"Contribution status updated to {contribution.status}.",
            "contribution": res_serializer.data,
        }, status=status.HTTP_200_OK)
