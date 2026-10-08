"""
URL configuration for Digital World Tour & Travels backend.
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.conf.urls.static import static


from drf_spectacular.utils import extend_schema
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)


class HealthCheckView(APIView):
    """
    Health check endpoint to verify backend service status.
    GET /api/v1/health/
    """
    @extend_schema(responses={200: dict})
    def get(self, request):
        return Response(
            {
                "success": True,
                "message": "Digital World Tour & Travels API is running"
            },
            status=status.HTTP_200_OK
        )


# API v1 URL patterns
api_v1_patterns = [
    path('health/', HealthCheckView.as_view(), name='api-health-check'),
    path('auth/', include('apps.users.urls')),
    path('customers/', include('apps.customers.urls')),
    path('tickets/', include('apps.tickets.urls')),
    path('flights/', include('apps.tickets.urls_flights')),
    path('visas/', include('apps.visas.urls')),
    path('hotels/', include('apps.hotels.urls')),
    path('hotel-bookings/', include('apps.hotels.urls_bookings')),
    path('payments/', include('apps.payments.urls')),
    path('invoices/', include('apps.invoices.urls')),
    path('notifications/', include('apps.notifications.urls')),
]

urlpatterns = [
    path('admin/', admin.site.urls),
    # API Endpoints
    path('api/v1/', include(api_v1_patterns)),
    # OpenAPI & Swagger API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
