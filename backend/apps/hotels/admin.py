"""
Django Admin registration for Hotel and HotelBooking models.
"""

from django.contrib import admin
from .models import Hotel, HotelBooking


@admin.register(Hotel)
class HotelAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'location', 'country', 'rating', 'price_per_night', 'is_active', 'created_at')
    list_filter = ('country', 'is_active', 'created_at')
    search_fields = ('name', 'location', 'country')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(HotelBooking)
class HotelBookingAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'hotel_name',
        'customer_email',
        'check_in',
        'check_out',
        'guests',
        'rooms',
        'status',
        'total_amount',
        'created_at',
    )
    list_filter = ('status', 'hotel', 'created_at')
    search_fields = ('hotel__name', 'customer__email', 'customer__full_name')
    readonly_fields = ('created_at', 'updated_at')

    def hotel_name(self, obj):
        return obj.hotel.name
    hotel_name.short_description = 'Hotel'

    def customer_email(self, obj):
        return obj.customer.email
    customer_email.short_description = 'Customer'
