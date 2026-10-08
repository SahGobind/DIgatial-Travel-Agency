"""
Service layer for User authentication, registration, JWT issuance, and profile retrieval.
"""

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import AuthenticationFailed, ValidationError
from .serializers import UserResponseSerializer

User = get_user_model()


class UserService:
    @staticmethod
    def get_tokens_for_user(user):
        """
        Generate JWT access and refresh tokens for a given user.
        """
        refresh = RefreshToken.for_user(user)
        # Custom claims if needed
        refresh['email'] = user.email
        refresh['role'] = user.role
        refresh['full_name'] = user.full_name

        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }

    @staticmethod
    def register_user(validated_data):
        """
        Create a new user account with securely hashed password and issue JWT tokens.
        """
        email = validated_data['email'].lower().strip()
        full_name = validated_data['full_name'].strip()
        phone = validated_data['phone'].strip()
        password = validated_data['password']

        user = User.objects.create_user(
            email=email,
            full_name=full_name,
            phone=phone,
            password=password,
        )

        tokens = UserService.get_tokens_for_user(user)
        user_data = UserResponseSerializer(user).data

        return {
            'user': user_data,
            'tokens': tokens,
        }

    @staticmethod
    def authenticate_user(email, password):
        """
        Authenticate user credentials, verify active status, and return JWT tokens.
        """
        normalized_email = email.lower().strip()
        user = User.objects.filter(email__iexact=normalized_email).first()

        if not user or not user.check_password(password):
            raise AuthenticationFailed("Invalid email or password.")

        if not user.is_active:
            raise AuthenticationFailed("User account is disabled. Please contact administration.")

        tokens = UserService.get_tokens_for_user(user)
        user_data = UserResponseSerializer(user).data

        return {
            'user': user_data,
            'tokens': tokens,
        }

    @staticmethod
    def refresh_access_token(refresh_token_str):
        """
        Validate refresh token and issue a new access token.
        """
        try:
            refresh = RefreshToken(refresh_token_str)
            return {
                'access': str(refresh.access_token),
            }
        except Exception as e:
            raise ValidationError({'refresh': 'Invalid or expired refresh token.'})
