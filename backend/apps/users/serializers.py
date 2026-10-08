"""
Serializers for User authentication, registration, token handling, and profile management.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError
import re

User = get_user_model()


class UserRegistrationSerializer(serializers.Serializer):
    """
    Serializer for user registration.
    Validates email uniqueness, password confirmation, and phone format.
    """
    full_name = serializers.CharField(max_length=255, required=True, trim_whitespace=True)
    email = serializers.EmailField(required=True)
    phone = serializers.CharField(max_length=30, required=True, trim_whitespace=True)
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        required=True,
        style={'input_type': 'password'}
    )
    confirm_password = serializers.CharField(
        write_only=True,
        min_length=8,
        required=False,
        allow_blank=True,
        style={'input_type': 'password'}
    )

    def validate_email(self, value):
        normalized_email = value.lower().strip()
        try:
            validate_email(normalized_email)
        except DjangoValidationError:
            raise serializers.ValidationError("Please provide a valid email address.")

        if User.objects.filter(email__iexact=normalized_email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return normalized_email

    def validate_phone(self, value):
        cleaned_phone = value.strip()
        # Ensure phone contains digits and acceptable characters (+, -, spaces)
        digit_count = sum(c.isdigit() for c in cleaned_phone)
        if digit_count < 7:
            raise serializers.ValidationError("Please provide a valid phone number (at least 7 digits).")
        return cleaned_phone

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        return value

    def validate(self, attrs):
        password = attrs.get('password')
        confirm_password = attrs.get('confirm_password')

        if confirm_password and password != confirm_password:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login authentication.
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    def validate_email(self, value):
        return value.lower().strip()


class UserResponseSerializer(serializers.ModelSerializer):
    """
    Public user representation for responses.
    Never exposes passwords or sensitive fields.
    """
    name = serializers.CharField(source='full_name', read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'full_name',
            'name',
            'email',
            'phone',
            'role',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields


class TokenRefreshSerializer(serializers.Serializer):
    """
    Serializer for refreshing JWT access tokens.
    """
    refresh = serializers.CharField(required=True)


class LogoutSerializer(serializers.Serializer):
    """
    Serializer for logging out and optional token invalidation.
    """
    refresh = serializers.CharField(required=False, allow_blank=True)
