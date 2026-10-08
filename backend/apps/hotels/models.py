"""
Hotel and HotelBooking models for Digital World Tour & Travels.
"""

from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class HotelBookingStatus(models.TextChoices):
    PENDING = 'PENDING', _('Pending')
    CONFIRMED = 'CONFIRMED', _('Confirmed')
    CANCELLED = 'CANCELLED', _('Cancelled')
    COMPLETED = 'COMPLETED', _('Completed')


class Hotel(models.Model):
    """
    Hotel listing domain entity.
    """
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255, verbose_name=_('Hotel Name'))
    location = models.CharField(max_length=255, verbose_name=_('City / Area Location'))
    country = models.CharField(max_length=100, verbose_name=_('Country'))
    description = models.TextField(blank=True, default='', verbose_name=_('Description'))
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=4.5, verbose_name=_('Rating'))
    price_per_night = models.DecimalField(max_digits=12, decimal_places=2, verbose_name=_('Price Per Night (NPR)'))
    amenities = models.JSONField(default=list, blank=True, verbose_name=_('Amenities'))
    image = models.CharField(max_length=500, blank=True, default='', verbose_name=_('Image URL'))
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        db_table = 'hotels'
        verbose_name = _('Hotel')
        verbose_name_plural = _('Hotels')
        ordering = ['-rating', 'price_per_night']

    def __str__(self):
        return f"{self.name} - {self.location}, {self.country} (NPR {self.price_per_night}/night)"


class HotelBooking(models.Model):
    """
    Hotel reservation booking entity.
    """
    id = models.BigAutoField(primary_key=True)
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='hotel_bookings',
        verbose_name=_('Customer')
    )
    hotel = models.ForeignKey(
        Hotel,
        on_delete=models.CASCADE,
        related_name='bookings',
        verbose_name=_('Hotel')
    )
    check_in = models.DateField(verbose_name=_('Check In Date'))
    check_out = models.DateField(verbose_name=_('Check Out Date'))
    guests = models.PositiveIntegerField(default=1, verbose_name=_('Guests Count'))
    rooms = models.PositiveIntegerField(default=1, verbose_name=_('Rooms Count'))
    status = models.CharField(
        max_length=30,
        choices=HotelBookingStatus.choices,
        default=HotelBookingStatus.PENDING,
        verbose_name=_('Booking Status')
    )
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name=_('Total Amount (NPR)'))
    special_requests = models.TextField(blank=True, default='', verbose_name=_('Special Requests'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        db_table = 'hotel_bookings'
        verbose_name = _('Hotel Booking')
        verbose_name_plural = _('Hotel Bookings')
        ordering = ['-created_at']

    def __str__(self):
        return f"Booking #{self.id}: {self.hotel.name} for {self.customer.email} [{self.status}]"
