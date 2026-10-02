import os
import urllib.parse
from .settings import *

# Security Hardening for Production (Phase 17)
DEBUG = False

SECRET_KEY = os.getenv("SECRET_KEY", "django-insecure-prod-key-change-me-2026")

ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "*").split(",")

# Security SSL/TLS & Cookie Headers
SECURE_SSL_REDIRECT = os.getenv("SECURE_SSL_REDIRECT", "False").lower() == "true"
SESSION_COOKIE_SECURE = os.getenv("SESSION_COOKIE_SECURE", "False").lower() == "true"
CSRF_COOKIE_SECURE = os.getenv("CSRF_COOKIE_SECURE", "False").lower() == "true"

SECURE_HSTS_SECONDS = 31536000  # 1 Year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

# Production Database (Parse DATABASE_URL if available)
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    url = urllib.parse.urlparse(DATABASE_URL)
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": url.path[1:],
            "USER": url.username,
            "PASSWORD": url.password,
            "HOST": url.hostname,
            "PORT": url.port or 5432,
        }
    }
