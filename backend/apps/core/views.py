from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.db import connection
import time


class HealthCheckView(APIView):
    """
    Health check endpoint to verify backend system state,
    database connection, and API responsiveness.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        db_status = "healthy"
        db_latency_ms = None
        
        try:
            start_time = time.time()
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1;")
                cursor.fetchone()
            db_latency_ms = round((time.time() - start_time) * 1000, 2)
        except Exception as e:
            db_status = f"unhealthy: {str(e)}"
            return Response(
                {
                    "status": "degraded",
                    "database": db_status,
                    "service": "Navapai Backend API",
                    "timestamp": time.time(),
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(
            {
                "status": "healthy",
                "service": "Navapai Backend API",
                "version": "1.0.0",
                "database": {
                    "status": db_status,
                    "engine": "PostgreSQL 18",
                    "latency_ms": db_latency_ms,
                },
                "timestamp": time.time(),
            },
            status=status.HTTP_200_OK,
        )
