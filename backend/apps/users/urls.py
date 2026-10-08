"""
URL configuration for User & Authentication endpoints.
"""

from django.urls import path
from .views import (
    AuthRootView,
    RegisterView,
    LoginView,
    CustomTokenRefreshView,
    CurrentUserView,
    LogoutView,
)

urlpatterns = [
    path('', AuthRootView.as_view(), name='auth-root'),
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='auth-token-refresh'),
    path('me/', CurrentUserView.as_view(), name='auth-me'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
]
