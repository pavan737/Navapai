from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, UserProfile
from .serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    UserProfileSerializer,
    CustomTokenObtainPairSerializer,
)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Login endpoint issuing JWT access & refresh tokens with user payload.
    """
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """
    User registration endpoint. Creates user, profile, subscription,
    and returns JWT tokens for immediate authenticated session.
    """
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        refresh["username"] = user.username
        refresh["email"] = user.email
        refresh["role"] = user.role
        refresh["is_staff"] = user.is_staff

        user_data = UserSerializer(user).data

        return Response(
            {
                "message": "User registered successfully.",
                "user": user_data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


class CurrentUserView(generics.RetrieveUpdateAPIView):
    """
    Endpoint for fetching and updating the authenticated user's details.
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Endpoint for fetching and updating the user's extended profile.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        return profile
