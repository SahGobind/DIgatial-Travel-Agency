"""
Django Admin registration for Nepal Roadway Transportation.
"""

from django.contrib import admin
from .models import (
    TransportVehicle,
    TransportRoute,
    TransportSchedule,
    TransportBooking,
)


@admin.register(TransportVehicle)
class TransportVehicleAdmin(admin.ModelAdmin):
    list_display = ('name', 'operator_name', 'vehicle_type', 'vehicle_number', 'total_seats', 'rating', 'is_active')
    list_filter = ('vehicle_type', 'is_active', 'operator_name')
    search_fields = ('name', 'operator_name', 'vehicle_number')
    ordering = ('vehicle_type', 'name')


@admin.register(TransportRoute)
class TransportRouteAdmin(admin.ModelAdmin):
    list_display = ('route_name', 'from_city', 'to_city', 'highway_name', 'distance_km', 'estimated_duration', 'is_active')
    list_filter = ('from_city', 'to_city', 'highway_name', 'is_active')
    search_fields = ('route_name', 'from_city', 'to_city', 'highway_name')
    ordering = ('from_city', 'to_city')


@admin.register(TransportSchedule)
class TransportScheduleAdmin(admin.ModelAdmin):
    list_display = ('route', 'vehicle', 'departure_time', 'arrival_time', 'shift', 'fare_npr', 'pricing_type', 'is_active')
    list_filter = ('shift', 'pricing_type', 'is_active', 'route__from_city', 'route__to_city')
    search_fields = ('route__route_name', 'vehicle__name', 'vehicle__operator_name')
    ordering = ('departure_time', 'fare_npr')


@admin.register(TransportBooking)
class TransportBookingAdmin(admin.ModelAdmin):
    list_display = (
        'booking_reference',
        'passenger_name',
        'passenger_phone',
        'get_route',
        'travel_date',
        'seat_count',
        'total_amount_npr',
        'status',
        'payment_status',
        'created_at'
    )
    list_filter = ('status', 'payment_status', 'travel_date', 'schedule__route__from_city')
    search_fields = ('booking_reference', 'passenger_name', 'passenger_phone', 'passenger_email')
    ordering = ('-created_at',)
    readonly_fields = ('booking_reference', 'created_at', 'updated_at')

    @admin.display(description='Route')
    def get_route(self, obj):
        return f"{obj.schedule.route.from_city} -> {obj.schedule.route.to_city}"
