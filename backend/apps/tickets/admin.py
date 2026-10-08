"""
Django Admin registration for TicketRequest and FlightBooking models.
Provides rich admin dashboard management for flights, tickets, payments, and audit logs.
"""

from django.contrib import admin
from .models import (
    TicketRequest,
    FlightBooking,
    FlightPassenger,
    FlightSegment,
    FlightTicket,
    FlightPayment,
    FlightAuditLog
)


@admin.register(TicketRequest)
class TicketRequestAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'customer_email',
        'trip_type',
        'from_location',
        'to_location',
        'departure_date',
        'travel_class',
        'status',
        'quotation_amount_npr',
        'created_at',
    )
    list_filter = ('status', 'trip_type', 'travel_class', 'created_at')
    search_fields = ('from_location', 'to_location', 'customer__email', 'customer__full_name')
    readonly_fields = ('created_at', 'updated_at')

    def customer_email(self, obj):
        return obj.customer.email if obj.customer else '-'
    customer_email.short_description = 'Customer'


class FlightPassengerInline(admin.TabularInline):
    model = FlightPassenger
    extra = 0
    fields = ('passenger_type', 'title', 'first_name', 'last_name', 'gender', 'date_of_birth', 'nationality', 'passport_number', 'seat_number')


class FlightSegmentInline(admin.TabularInline):
    model = FlightSegment
    extra = 0
    fields = ('airline_code', 'airline_name', 'flight_number', 'origin', 'destination', 'departure_time', 'arrival_time', 'cabin_class')


class FlightTicketInline(admin.TabularInline):
    model = FlightTicket
    extra = 0
    fields = ('ticket_number', 'passenger', 'status', 'issued_at')
    readonly_fields = ('issued_at',)


class FlightPaymentInline(admin.TabularInline):
    model = FlightPayment
    extra = 0
    fields = ('provider', 'provider_reference', 'amount', 'currency', 'status', 'created_at')
    readonly_fields = ('created_at',)


@admin.register(FlightBooking)
class FlightBookingAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'pnr',
        'customer_email',
        'origin',
        'destination',
        'departure_date',
        'total_amount',
        'currency',
        'status',
        'created_at',
    )
    list_filter = ('status', 'provider', 'cabin_class', 'departure_date', 'created_at')
    search_fields = ('pnr', 'provider_booking_reference', 'customer__email', 'customer__full_name', 'origin', 'destination')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [FlightPassengerInline, FlightSegmentInline, FlightTicketInline, FlightPaymentInline]

    def customer_email(self, obj):
        return obj.customer.email if obj.customer else '-'
    customer_email.short_description = 'Customer'


@admin.register(FlightPassenger)
class FlightPassengerAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'booking_pnr',
        'passenger_type',
        'title',
        'first_name',
        'last_name',
        'nationality',
        'seat_number',
    )
    list_filter = ('passenger_type', 'gender', 'nationality')
    search_fields = ('first_name', 'last_name', 'passport_number', 'booking__pnr')

    def booking_pnr(self, obj):
        return obj.booking.pnr or f"Booking #{obj.booking.id}"
    booking_pnr.short_description = 'Booking PNR'


@admin.register(FlightTicket)
class FlightTicketAdmin(admin.ModelAdmin):
    list_display = (
        'ticket_number',
        'booking_pnr',
        'passenger_name',
        'status',
        'issued_at',
        'created_at',
    )
    list_filter = ('status', 'created_at')
    search_fields = ('ticket_number', 'booking__pnr', 'passenger__first_name', 'passenger__last_name')
    readonly_fields = ('created_at',)

    def booking_pnr(self, obj):
        return obj.booking.pnr or f"Booking #{obj.booking.id}"
    booking_pnr.short_description = 'Booking PNR'

    def passenger_name(self, obj):
        return f"{obj.passenger.first_name} {obj.passenger.last_name}"
    passenger_name.short_description = 'Passenger'


@admin.register(FlightPayment)
class FlightPaymentAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'booking_pnr',
        'customer_email',
        'amount',
        'currency',
        'provider',
        'provider_reference',
        'status',
        'created_at',
    )
    list_filter = ('status', 'provider', 'currency', 'created_at')
    search_fields = ('provider_reference', 'booking__pnr', 'customer__email')
    readonly_fields = ('created_at', 'updated_at')

    def booking_pnr(self, obj):
        return obj.booking.pnr or f"Booking #{obj.booking.id}"
    booking_pnr.short_description = 'Booking PNR'

    def customer_email(self, obj):
        return obj.customer.email if obj.customer else '-'
    customer_email.short_description = 'Customer'


@admin.register(FlightAuditLog)
class FlightAuditLogAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'event_type',
        'actor_email',
        'booking_reference',
        'pnr',
        'created_at',
    )
    list_filter = ('event_type', 'created_at')
    search_fields = ('event_type', 'booking_reference', 'pnr', 'actor__email')
    readonly_fields = ('created_at',)

    def actor_email(self, obj):
        return obj.actor.email if obj.actor else 'System'
    actor_email.short_description = 'Actor'
