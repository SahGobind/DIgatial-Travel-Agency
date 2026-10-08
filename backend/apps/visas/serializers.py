"""
Serializers for Visa Applications and Document Uploads.
"""

from rest_framework import serializers
from django.utils import timezone
from .models import VisaApplication, VisaDocument, VisaType, VisaStatus
from .validators import validate_visa_document_file
from apps.users.serializers import UserResponseSerializer


class VisaDocumentSerializer(serializers.ModelSerializer):
    """
    Serializer for representing uploaded visa documents.
    """
    class Meta:
        model = VisaDocument
        fields = [
            'id',
            'document_type',
            'file',
            'file_name',
            'file_size',
            'mime_type',
            'created_at',
        ]
        read_only_fields = ['id', 'file_name', 'file_size', 'mime_type', 'created_at']


class VisaDocumentUploadSerializer(serializers.Serializer):
    """
    Serializer for handling document upload requests with strict security validations.
    """
    document_type = serializers.CharField(max_length=100, default='PASSPORT')
    file = serializers.FileField(validators=[validate_visa_document_file], required=True)


class VisaApplicationSerializer(serializers.ModelSerializer):
    """
    Main serializer for creating and viewing Visa Applications.
    """
    customer_details = UserResponseSerializer(source='customer', read_only=True)
    documents = VisaDocumentSerializer(many=True, read_only=True)
    visa_type = serializers.ChoiceField(choices=VisaType.choices, default=VisaType.TOURIST)
    status = serializers.ChoiceField(choices=VisaStatus.choices, default=VisaStatus.SUBMITTED, read_only=True)
    admin_notes = serializers.CharField(read_only=True, required=False)
    rejection_reason = serializers.CharField(read_only=True, required=False)
    government_fee_npr = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True, required=False)

    class Meta:
        model = VisaApplication
        fields = [
            'id',
            'customer',
            'customer_details',
            'country',
            'visa_type',
            'full_name',
            'phone',
            'email',
            'passport_number',
            'travel_date',
            'nationality',
            'status',
            'documents',
            'admin_notes',
            'rejection_reason',
            'government_fee_npr',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'customer',
            'customer_details',
            'status',
            'documents',
            'admin_notes',
            'rejection_reason',
            'government_fee_npr',
            'created_at',
            'updated_at',
        ]

    def validate_travel_date(self, value):
        today = timezone.now().date()
        if value < today:
            raise serializers.ValidationError("Expected travel date cannot be in the past.")
        return value

    def validate_passport_number(self, value):
        cleaned = value.strip().upper()
        if len(cleaned) < 5:
            raise serializers.ValidationError("Please provide a valid passport number (at least 5 characters).")
        return cleaned

    def validate_phone(self, value):
        cleaned = value.strip()
        digit_count = sum(c.isdigit() for c in cleaned)
        if digit_count < 7:
            raise serializers.ValidationError("Please provide a valid phone number (at least 7 digits).")
        return cleaned


class VisaApplicationAdminUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for Admin/Staff updates to status, processing notes, fees, and rejection reasons.
    """
    status = serializers.ChoiceField(choices=VisaStatus.choices, required=False)
    admin_notes = serializers.CharField(required=False, allow_blank=True)
    rejection_reason = serializers.CharField(required=False, allow_blank=True)
    government_fee_npr = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)

    class Meta:
        model = VisaApplication
        fields = [
            'status',
            'admin_notes',
            'rejection_reason',
            'government_fee_npr',
            'country',
            'visa_type',
            'full_name',
            'phone',
            'email',
            'passport_number',
            'travel_date',
            'nationality',
        ]


class VisaApplicationCustomerUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for Customer updates to travel information.
    """
    class Meta:
        model = VisaApplication
        fields = [
            'country',
            'visa_type',
            'full_name',
            'phone',
            'email',
            'passport_number',
            'travel_date',
            'nationality',
        ]

    def validate_travel_date(self, value):
        today = timezone.now().date()
        if value < today:
            raise serializers.ValidationError("Expected travel date cannot be in the past.")
        return value
