"""
Django Admin registration for VisaApplication and VisaDocument models.
"""

from django.contrib import admin
from .models import VisaApplication, VisaDocument


class VisaDocumentInline(admin.TabularInline):
    model = VisaDocument
    extra = 0
    readonly_fields = ('file_name', 'file_size', 'mime_type', 'created_at')


@admin.register(VisaApplication)
class VisaApplicationAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'full_name',
        'customer_email',
        'country',
        'visa_type',
        'passport_number',
        'travel_date',
        'status',
        'government_fee_npr',
        'created_at',
    )
    list_filter = ('status', 'visa_type', 'country', 'created_at')
    search_fields = ('full_name', 'passport_number', 'email', 'customer__email', 'country')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [VisaDocumentInline]

    def customer_email(self, obj):
        return obj.customer.email
    customer_email.short_description = 'Customer'


@admin.register(VisaDocument)
class VisaDocumentAdmin(admin.ModelAdmin):
    list_display = ('id', 'application_id', 'document_type', 'file_name', 'file_size', 'created_at')
    list_filter = ('document_type', 'created_at')
    search_fields = ('file_name', 'application__full_name', 'application__passport_number')
    readonly_fields = ('file_name', 'file_size', 'mime_type', 'created_at')
