from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile, Subscription


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("username", "email", "role", "is_verified", "is_staff", "created_at")
    list_filter = ("role", "is_verified", "is_staff", "is_active")
    fieldsets = (
        (None, {"fields": ("username", "email", "password")}),
        ("Personal Info", {"fields": ("first_name", "last_name", "phone")}),
        ("Permissions & Role", {"fields": ("role", "is_verified", "is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    search_fields = ("username", "email", "phone")
    ordering = ("-created_at",)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "location", "github_username", "linkedin_url", "updated_at")
    search_fields = ("user__username", "user__email", "location", "github_username")


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ("user", "tier", "is_active", "started_at", "expires_at")
    list_filter = ("tier", "is_active")
    search_fields = ("user__username", "user__email")
