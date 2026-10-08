"""
Serializers for Customer profile management.
"""

from rest_framework import serializers


class CustomerSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    fullName = serializers.CharField(max_length=255, required=True)
    email = serializers.EmailField(required=True)
    phone = serializers.CharField(max_length=20, required=True)
    address = serializers.CharField(max_length=500, required=False, allow_blank=True)
    passportNumber = serializers.CharField(max_length=50, required=False, allow_blank=True)
    citizenshipNumber = serializers.CharField(max_length=50, required=False, allow_blank=True)
    totalBookings = serializers.IntegerField(read_only=True, default=0)
    createdAt = serializers.DateTimeField(read_only=True)
