"""
VisaApplication and VisaDocument models for Digital World Tour & Travels.
Supports multiple visa types, lifecycle statuses, customer associations, and secure document storage.
"""

from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class VisaType(models.TextChoices):
    TOURIST = 'TOURIST', _('Tourist')
    WORK = 'WORK', _('Work')
    BUSINESS = 'BUSINESS', _('Business')
    STUDENT = 'STUDENT', _('Student')


class VisaStatus(models.TextChoices):
    SUBMITTED = 'SUBMITTED', _('Submitted')
    UNDER_REVIEW = 'UNDER_REVIEW', _('Under Review')
    DOCUMENT_REQUIRED = 'DOCUMENT_REQUIRED', _('Document Required')
    PROCESSING = 'PROCESSING', _('Processing')
    APPROVED = 'APPROVED', _('Approved')
    REJECTED = 'REJECTED', _('Rejected')
    COMPLETED = 'COMPLETED', _('Completed')


class VisaApplication(models.Model):
    """
    Visa application entity submitted by customers and managed by staff/admin.
    """
    id = models.BigAutoField(primary_key=True)
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='visa_applications',
        verbose_name=_('Customer')
    )
    country = models.CharField(max_length=100, verbose_name=_('Destination Country'))
    visa_type = models.CharField(
        max_length=30,
        choices=VisaType.choices,
        default=VisaType.TOURIST,
        verbose_name=_('Visa Type')
    )
    full_name = models.CharField(max_length=255, verbose_name=_('Full Name as in Passport'))
    phone = models.CharField(max_length=30, verbose_name=_('Contact Phone'))
    email = models.EmailField(verbose_name=_('Email Address'))
    passport_number = models.CharField(max_length=50, verbose_name=_('Passport Number'))
    travel_date = models.DateField(verbose_name=_('Expected Travel Date'))
    nationality = models.CharField(max_length=100, default='Nepalese', verbose_name=_('Nationality'))
    status = models.CharField(
        max_length=30,
        choices=VisaStatus.choices,
        default=VisaStatus.SUBMITTED,
        verbose_name=_('Application Status')
    )
    # Admin / Processing info
    admin_notes = models.TextField(blank=True, default='', verbose_name=_('Admin Notes'))
    rejection_reason = models.TextField(blank=True, default='', verbose_name=_('Rejection Reason'))
    government_fee_npr = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Government / Processing Fee (NPR)')
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        db_table = 'visa_applications'
        verbose_name = _('Visa Application')
        verbose_name_plural = _('Visa Applications')
        ordering = ['-created_at']

    def __str__(self):
        return f"Visa #{self.id}: {self.full_name} - {self.country} ({self.visa_type}) [{self.status}]"


class VisaDocument(models.Model):
    """
    Secure document attachments (Passport copies, photos, bank statements) for a visa application.
    """
    id = models.BigAutoField(primary_key=True)
    application = models.ForeignKey(
        VisaApplication,
        on_delete=models.CASCADE,
        related_name='documents',
        verbose_name=_('Visa Application')
    )
    document_type = models.CharField(max_length=100, default='PASSPORT', verbose_name=_('Document Type'))
    file = models.FileField(upload_to='visa_documents/%Y/%m/', verbose_name=_('Document File'))
    file_name = models.CharField(max_length=255, verbose_name=_('Original File Name'))
    file_size = models.PositiveIntegerField(help_text=_('File size in bytes'), verbose_name=_('File Size (Bytes)'))
    mime_type = models.CharField(max_length=100, blank=True, default='', verbose_name=_('MIME Type'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Uploaded At'))

    class Meta:
        db_table = 'visa_documents'
        verbose_name = _('Visa Document')
        verbose_name_plural = _('Visa Documents')
        ordering = ['-created_at']

    def __str__(self):
        return f"Doc #{self.id} ({self.document_type}) for Visa #{self.application_id}"
