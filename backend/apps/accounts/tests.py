from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import User, UserProfile, Subscription


class AccountsAuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse("auth-register")
        self.login_url = reverse("auth-login")
        self.me_url = reverse("auth-me")
        
        self.valid_user_data = {
            "email": "developer@navapai.org",
            "username": "navadev",
            "first_name": "Nava",
            "last_name": "Pai",
            "phone": "+1234567890",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!",
        }

    def test_user_registration_success(self):
        response = self.client.post(self.register_url, self.valid_user_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertIn("user", response.data)
        self.assertEqual(response.data["user"]["email"], "developer@navapai.org")
        self.assertEqual(response.data["user"]["username"], "navadev")

        # Verify database record and signals
        user = User.objects.get(email="developer@navapai.org")
        self.assertTrue(UserProfile.objects.filter(user=user).exists())
        self.assertTrue(Subscription.objects.filter(user=user, tier=Subscription.Tier.FREE).exists())

    def test_user_registration_password_mismatch(self):
        invalid_data = self.valid_user_data.copy()
        invalid_data["password_confirm"] = "DifferentPassword123!"
        response = self.client.post(self.register_url, invalid_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)

    def test_user_login_success(self):
        # Register user first
        self.client.post(self.register_url, self.valid_user_data, format="json")

        login_payload = {
            "email": "developer@navapai.org",
            "password": "SecurePassword123!",
        }
        response = self.client.post(self.login_url, login_payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertIn("user", response.data)
        self.assertEqual(response.data["user"]["username"], "navadev")

    def test_authenticated_me_endpoint(self):
        reg_response = self.client.post(self.register_url, self.valid_user_data, format="json")
        access_token = reg_response.data["access"]

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "developer@navapai.org")
        self.assertEqual(response.data["username"], "navadev")
