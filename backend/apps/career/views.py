from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from apps.accounts.models import User
from .models import Certification, CareerMilestone
from .serializers import CertificationSerializer, CareerMilestoneSerializer


class CertificationListCreateView(generics.ListCreateAPIView):
    """
    List or create professional certifications owned by request.user.
    """
    serializer_class = CertificationSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Certification.objects.filter(user=self.request.user)


class CertificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a certification owned by request.user.
    """
    serializer_class = CertificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Certification.objects.filter(user=self.request.user)


class CareerMilestoneListCreateView(generics.ListCreateAPIView):
    """
    List or create career milestones owned by request.user.
    """
    serializer_class = CareerMilestoneSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return CareerMilestone.objects.filter(user=self.request.user)


class CareerMilestoneDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a career milestone owned by request.user.
    """
    serializer_class = CareerMilestoneSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CareerMilestone.objects.filter(user=self.request.user)


class PublicCareerTimelineView(APIView):
    """
    Public timeline of developer's verified certifications and milestones by username.
    """
    permission_classes = [AllowAny]

    def get(self, request, username, *args, **kwargs):
        target_user = get_object_or_404(User, username__iexact=username)
        certifications = Certification.objects.filter(user=target_user)
        milestones = CareerMilestone.objects.filter(user=target_user)

        cert_serializer = CertificationSerializer(certifications, many=True)
        mile_serializer = CareerMilestoneSerializer(milestones, many=True)

        return Response({
            "username": target_user.username,
            "full_name": target_user.get_full_name() or target_user.username,
            "certifications": cert_serializer.data,
            "milestones": mile_serializer.data,
        }, status=status.HTTP_200_OK)
