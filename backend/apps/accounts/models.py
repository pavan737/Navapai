from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db.models.signals import post_save
from django.dispatch import receiver


class CustomUserManager(BaseUserManager):
    """
    Custom user model manager where email is the unique identifier
    for authentication instead of usernames.
    """
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set.")
        if not username:
            raise ValueError("The Username field must be set.")
        email = self.normalize_email(email)
        username = username.strip()
        user = self.model(email=email, username=username, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Role.ADMIN)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, username, password, **extra_fields)


class User(AbstractUser):
    """
    Primary User identity model for Navapai.
    Supports email authentication, role-based access control,
    and phone verification fields.
    """
    class Role(models.TextChoices):
        LEARNER = "LEARNER", "Learner"
        CORE_MAINTAINER = "CORE_MAINTAINER", "Core Maintainer"
        ADMIN = "ADMIN", "Administrator"

    email = models.EmailField(unique=True, db_index=True)
    username = models.CharField(max_length=150, unique=True, db_index=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.LEARNER,
        db_index=True,
    )
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return f"{self.username} ({self.email})"


class UserProfile(models.Model):
    """
    Extended user profile for portfolio, bio, skills, and social links.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    bio = models.TextField(blank=True, default="")
    location = models.CharField(max_length=150, blank=True, default="")
    skills = models.JSONField(default=list, blank=True)
    github_username = models.CharField(max_length=100, blank=True, default="")
    linkedin_url = models.URLField(blank=True, default="")
    website_url = models.URLField(blank=True, default="")

    # Phase 15: Public Portfolio Customizations
    portfolio_slug = models.CharField(max_length=100, unique=True, null=True, blank=True, db_index=True)
    is_portfolio_public = models.BooleanField(default=True)
    theme_color = models.CharField(max_length=30, default="#0082FF")
    custom_headline = models.CharField(max_length=255, blank=True, default="")
    show_heatmap = models.BooleanField(default=True)
    show_certifications = models.BooleanField(default=True)
    show_badges = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        return f"Profile of {self.user.username}"


class Subscription(models.Model):
    """
    Subscription tier tracking (kept cleanly decoupled from User identity).
    """
    class Tier(models.TextChoices):
        FREE = "FREE", "Free"
        SUBSCRIBER = "SUBSCRIBER", "Subscriber"
        PREMIUM = "PREMIUM", "Premium"

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="subscription",
    )
    tier = models.CharField(
        max_length=20,
        choices=Tier.choices,
        default=Tier.FREE,
    )
    is_active = models.BooleanField(default=True)
    started_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.tier}"


@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
        Subscription.objects.create(user=instance)
    else:
        if hasattr(instance, "profile"):
            instance.profile.save()
        if hasattr(instance, "subscription"):
            instance.subscription.save()
