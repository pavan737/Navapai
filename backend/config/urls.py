from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("apps.core.urls")),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/domains/", include("apps.domains.urls")),
    path("api/projects/", include("apps.projects.urls")),
    path("api/tasks/", include("apps.tasks.urls")),
    path("api/notes/", include("apps.notes.urls")),
    path("api/resources/", include("apps.resources.urls")),
    path("api/career/", include("apps.career.urls")),
    path("api/gamification/", include("apps.gamification.urls")),
    path("api/community/", include("apps.community.urls")),
    path("api/analytics/", include("apps.analytics.urls")),
    path("api/admin-suite/", include("apps.admin_suite.urls")),
]






if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
