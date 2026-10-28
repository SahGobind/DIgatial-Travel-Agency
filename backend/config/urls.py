"""
URL configuration for Digital World Tour & Travels backend.
"""

from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.conf import settings
from django.conf.urls.static import static


from drf_spectacular.utils import extend_schema
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)


class ApiRootView(APIView):
    """
    Root endpoint for Digital World Tour & Travels Backend.
    Provides friendly landing page and navigation to API docs and frontend.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        if 'text/html' in request.META.get('HTTP_ACCEPT', ''):
            html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Digital World Tour &amp; Travels - Backend API Server</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #0B2A6F; color: #fff; margin: 0; padding: 40px 20px; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
        .card { background: #ffffff; color: #1e293b; max-width: 680px; width: 100%; border-radius: 28px; padding: 40px 36px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.4); }
        .badge { display: inline-flex; align-items: center; gap: 6px; background: #dcfce7; color: #15803d; font-size: 12px; font-weight: 800; padding: 6px 14px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px; }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; }
        h1 { font-size: 26px; font-weight: 900; color: #0B2A6F; margin: 16px 0 6px 0; }
        p { color: #64748b; font-size: 14px; margin-bottom: 28px; line-height: 1.6; }
        .links-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .btn { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-radius: 14px; text-decoration: none; font-size: 13px; font-weight: 700; transition: all 0.2s; border: 1px solid #e2e8f0; }
        .btn-frontend { background: #D71920; color: #fff; border: none; grid-column: span 2; padding: 16px 20px; font-size: 15px; box-shadow: 0 4px 12px rgba(215,25,32,0.3); }
        .btn-frontend:hover { background: #b5141a; }
        .btn-primary { background: #f8fafc; color: #0B2A6F; }
        .btn-primary:hover { background: #eff6ff; border-color: #93c5fd; }
        .footer { margin-top: 28px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="card">
        <span class="badge"><span class="dot"></span> Backend Server Online</span>
        <h1>Digital World Tour &amp; Travels</h1>
        <p>The Django REST backend server is working properly. The website user interface (React app) is accessible at <strong>http://localhost:5173</strong>. Use the buttons below:</p>
        
        <div class="links-grid">
            <a href="http://localhost:5173" class="btn btn-frontend">
                <span>🌐 Open Website Frontend (React App)</span>
                <span>http://localhost:5173 ➔</span>
            </a>
            <a href="/api/docs/" class="btn btn-primary">
                <span>📖 Swagger API Documentation</span>
                <span>/api/docs/</span>
            </a>
            <a href="/api/redoc/" class="btn btn-primary">
                <span>📋 ReDoc API Reference</span>
                <span>/api/redoc/</span>
            </a>
            <a href="/admin/" class="btn btn-primary">
                <span>⚙️ Django Admin Panel</span>
                <span>/admin/</span>
            </a>
            <a href="/api/v1/health/" class="btn btn-primary">
                <span>💓 Health Check Endpoint</span>
                <span>/api/v1/health/</span>
            </a>
        </div>
        
        <div class="footer">
            Digital World Tour &amp; Travels • Janakpur Dham, Nepal
        </div>
    </div>
</body>
</html>"""
            return HttpResponse(html_content, content_type='text/html')

        return Response({
            "success": True,
            "message": "Digital World Tour & Travels Backend API Server is running",
            "version": "1.0.0",
            "frontend_url": "http://localhost:5173",
            "docs": {
                "swagger": "/api/docs/",
                "redoc": "/api/redoc/",
                "schema": "/api/schema/"
            },
            "endpoints": {
                "health": "/api/v1/health/",
                "admin": "/admin/",
                "transports": "/api/v1/transports/search/",
                "flights": "/api/v1/flights/search/",
                "hotels": "/api/v1/hotels/",
                "visas": "/api/v1/visas/",
                "invoices": "/api/v1/invoices/"
            }
        })


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
    path('transports/', include('apps.transports.urls')),
    path('payments/', include('apps.payments.urls')),
    path('invoices/', include('apps.invoices.urls')),
    path('notifications/', include('apps.notifications.urls')),
]

urlpatterns = [
    path('', ApiRootView.as_view(), name='api-root'),
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
