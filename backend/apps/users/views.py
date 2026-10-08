"""
Views for User authentication, JWT tokens, and current user profile management.
"""

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from drf_spectacular.utils import extend_schema
from common.responses import success_response, error_response
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserResponseSerializer,
    TokenRefreshSerializer,
    LogoutSerializer,
)
from .services import UserService


class RegisterView(APIView):
    """
    POST /api/v1/auth/register/
    Register a new customer account.
    """
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer

    @extend_schema(request=UserRegistrationSerializer, responses={201: UserResponseSerializer})
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            result = UserService.register_user(serializer.validated_data)
            return success_response(
                data=result,
                message="Account registered successfully.",
                status_code=status.HTTP_201_CREATED
            )

        # Extract specific first error message for clear client feedback
        error_msg = "Registration validation failed."
        for field, field_errs in serializer.errors.items():
            if isinstance(field_errs, list) and len(field_errs) > 0:
                error_msg = str(field_errs[0])
                break
            elif isinstance(field_errs, str):
                error_msg = field_errs
                break

        return error_response(
            errors=serializer.errors,
            message=error_msg,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class LoginView(APIView):
    """
    POST /api/v1/auth/login/
    Authenticate user with email and password, returning JWT access & refresh tokens.
    """
    permission_classes = [AllowAny]
    serializer_class = UserLoginSerializer

    @extend_schema(request=UserLoginSerializer)
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            result = UserService.authenticate_user(
                email=serializer.validated_data['email'],
                password=serializer.validated_data['password']
            )
            return success_response(
                data=result,
                message="Login successful.",
                status_code=status.HTTP_200_OK
            )
        return error_response(
            errors=serializer.errors,
            message="Invalid credentials.",
            status_code=status.HTTP_400_BAD_REQUEST
        )


class CustomTokenRefreshView(APIView):
    """
    POST /api/v1/auth/token/refresh/
    Refresh JWT access token using a valid refresh token.
    """
    permission_classes = [AllowAny]
    serializer_class = TokenRefreshSerializer

    @extend_schema(request=TokenRefreshSerializer)
    def post(self, request):
        serializer = TokenRefreshSerializer(data=request.data)
        if serializer.is_valid():
            result = UserService.refresh_access_token(serializer.validated_data['refresh'])
            return success_response(
                data=result,
                message="Token refreshed successfully.",
                status_code=status.HTTP_200_OK
            )
        return error_response(
            errors=serializer.errors,
            message="Token refresh failed.",
            status_code=status.HTTP_400_BAD_REQUEST
        )


class CurrentUserView(APIView):
    """
    GET /api/v1/auth/me/
    Retrieve current authenticated user's profile details.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserResponseSerializer

    @extend_schema(responses={200: UserResponseSerializer})
    def get(self, request):
        serializer = UserResponseSerializer(request.user)
        return success_response(
            data=serializer.data,
            message="Current user profile retrieved successfully.",
            status_code=status.HTTP_200_OK
        )


class LogoutView(APIView):
    """
    POST /api/v1/auth/logout/
    Log out the user.
    """
    permission_classes = [AllowAny]
    serializer_class = LogoutSerializer

    @extend_schema(request=LogoutSerializer)
    def post(self, request):
        return success_response(
            data={},
            message="Logged out successfully.",
            status_code=status.HTTP_200_OK
        )


class AuthRootView(APIView):
    """
    GET /api/v1/auth/
    Root descriptor for authentication endpoints.
    """
    permission_classes = [AllowAny]

    @extend_schema(responses={200: dict})
    def get(self, request):
        return success_response(
            data={
                "endpoints": {
                    "register": "/api/v1/auth/register/",
                    "login": "/api/v1/auth/login/",
                    "token_refresh": "/api/v1/auth/token/refresh/",
                    "me": "/api/v1/auth/me/",
                    "logout": "/api/v1/auth/logout/",
                }
            },
            message="Auth API endpoints"
        )
