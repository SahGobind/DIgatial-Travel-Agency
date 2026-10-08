"""
TicketRequest Model for Digital World Tour & Travels.
Supports One-Way, Round-Trip, Cabin Classes, Special Requests, and Lifecycle Statuses.
"""

from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class TripType(models.TextChoices):
    ONE_WAY = 'ONE_WAY', _('One Way')
    ROUND_TRIP = 'ROUND_TRIP', _('Round Trip')


class TravelClass(models.TextChoices):
    ECONOMY = 'ECONOMY', _('Economy')
    PREMIUM_ECONOMY = 'PREMIUM_ECONOMY', _('Premium Economy')
    BUSINESS = 'BUSINESS', _('Business')
    FIRST = 'FIRST', _('First')


class TicketStatus(models.TextChoices):
    PENDING = 'PENDING', _('Pending')
    PROCESSING = 'PROCESSING', _('Processing')
    QUOTATION_SENT = 'QUOTATION_SENT', _('Quotation Sent')
    CONFIRMED = 'CONFIRMED', _('Confirmed')
    CANCELLED = 'CANCELLED', _('Cancelled')
    COMPLETED = 'COMPLETED', _('Completed')


class TicketRequest(models.Model):
    """
    Flight ticket inquiry and reservation request.
    """
    id = models.BigAutoField(primary_key=True)
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ticket_requests',
        verbose_name=_('Customer')
    )
    trip_type = models.CharField(
        max_length=20,
        choices=TripType.choices,
        default=TripType.ONE_WAY,
        verbose_name=_('Trip Type')
    )
    from_location = models.CharField(max_length=255, verbose_name=_('From Location'))
    to_location = models.CharField(max_length=255, verbose_name=_('To Location'))
    departure_date = models.DateField(verbose_name=_('Departure Date'))
    return_date = models.DateField(null=True, blank=True, verbose_name=_('Return Date'))
    adults = models.PositiveIntegerField(default=1, verbose_name=_('Adults'))
    children = models.PositiveIntegerField(default=0, verbose_name=_('Children'))
    travel_class = models.CharField(
        max_length=30,
        choices=TravelClass.choices,
        default=TravelClass.ECONOMY,
        verbose_name=_('Travel Class')
    )
    special_request = models.TextField(blank=True, default='', verbose_name=_('Special Request'))
    status = models.CharField(
        max_length=30,
        choices=TicketStatus.choices,
        default=TicketStatus.PENDING,
        verbose_name=_('Status')
    )
    # Admin / Staff Processing Information
    admin_notes = models.TextField(blank=True, default='', verbose_name=_('Admin Notes'))
    quotation_amount_npr = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Quotation Amount (NPR)')
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        db_table = 'ticket_requests'
        verbose_name = _('Ticket Request')
        verbose_name_plural = _('Ticket Requests')
        ordering = ['-created_at']

    def __str__(self):
        return f"Ticket #{self.id}: {self.from_location} -> {self.to_location} ({self.customer.email}) [{self.status}]"


# =====================================================================
# STEP 28: PRODUCTION FLIGHT BOOKING & GDS RELATIONAL SCHEMA
# =====================================================================

class FlightBookingStatus(models.TextChoices):
    PAYMENT_PENDING = 'PAYMENT_PENDING', _('Payment Pending')
    PAYMENT_SUCCESS = 'PAYMENT_SUCCESS', _('Payment Success')
    BOOKING_IN_PROGRESS = 'BOOKING_IN_PROGRESS', _('Booking In Progress')
    BOOKED = 'BOOKED', _('Booked')
    TICKETING_IN_PROGRESS = 'TICKETING_IN_PROGRESS', _('Ticketing In Progress')
    TICKETED = 'TICKETED', _('Ticketed')
    FAILED = 'FAILED', _('Failed')
    CANCELLED = 'CANCELLED', _('Cancelled')
    REFUND_PENDING = 'REFUND_PENDING', _('Refund Pending')
    REFUNDED = 'REFUNDED', _('Refunded')


class FlightTicketStatus(models.TextChoices):
    PENDING = 'PENDING', _('Pending')
    ISSUED = 'ISSUED', _('Issued')
    FAILED = 'FAILED', _('Failed')
    VOIDED = 'VOIDED', _('Voided')
    REFUNDED = 'REFUNDED', _('Refunded')


class PaymentStatus(models.TextChoices):
    PENDING = 'PENDING', _('Pending')
    PROCESSING = 'PROCESSING', _('Processing')
    SUCCESS = 'SUCCESS', _('Success')
    FAILED = 'FAILED', _('Failed')
    CANCELLED = 'CANCELLED', _('Cancelled')
    REFUNDED = 'REFUNDED', _('Refunded')


class FlightBooking(models.Model):
    """
    Core production flight booking record synchronized with Travelport GDS.
    """
    id = models.BigAutoField(primary_key=True)
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='flight_bookings',
        verbose_name=_('Customer')
    )
    provider = models.CharField(
        max_length=50,
        default='TRAVELPORT',
        verbose_name=_('GDS Provider')
    )
    provider_booking_reference = models.CharField(
        max_length=100,
        blank=True,
        db_index=True,
        verbose_name=_('Provider Booking Reference')
    )
    pnr = models.CharField(
        max_length=20,
        blank=True,
        db_index=True,
        verbose_name=_('Airline PNR / Record Locator')
    )
    status = models.CharField(
        max_length=30,
        choices=FlightBookingStatus.choices,
        default=FlightBookingStatus.PAYMENT_PENDING,
        db_index=True,
        verbose_name=_('Booking Status')
    )
    currency = models.CharField(
        max_length=10,
        default='NPR',
        verbose_name=_('Currency')
    )
    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name=_('Total Amount')
    )
    idempotency_key = models.CharField(
        max_length=100,
        unique=True,
        null=True,
        blank=True,
        db_index=True,
        verbose_name=_('Idempotency Key')
    )
    origin = models.CharField(max_length=100, verbose_name=_('Origin'))
    destination = models.CharField(max_length=100, verbose_name=_('Destination'))
    departure_date = models.DateField(db_index=True, verbose_name=_('Departure Date'))
    return_date = models.DateField(null=True, blank=True, verbose_name=_('Return Date'))
    cabin_class = models.CharField(max_length=30, default='ECONOMY', verbose_name=_('Cabin Class'))
    fare_tier = models.CharField(max_length=30, default='STANDARD', verbose_name=_('Fare Tier'))
    special_requests = models.TextField(blank=True, default='', verbose_name=_('Special Requests'))
    created_at = models.DateTimeField(auto_now_add=True, db_index=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        db_table = 'flight_bookings'
        verbose_name = _('Flight Booking')
        verbose_name_plural = _('Flight Bookings')
        ordering = ['-created_at']

    def __str__(self):
        return f"Booking #{self.id} [PNR: {self.pnr or 'PENDING'}] - {self.origin} → {self.destination} ({self.status})"


class FlightPassenger(models.Model):
    """
    Passenger personal and travel document information adhering to ICAO/IATA standards.
    """
    id = models.BigAutoField(primary_key=True)
    booking = models.ForeignKey(
        FlightBooking,
        on_delete=models.CASCADE,
        related_name='passengers',
        verbose_name=_('Booking')
    )
    passenger_type = models.CharField(
        max_length=20,
        choices=[('ADULT', 'Adult'), ('CHILD', 'Child'), ('INFANT', 'Infant')],
        default='ADULT',
        verbose_name=_('Passenger Type')
    )
    title = models.CharField(max_length=10, default='MR', verbose_name=_('Title'))
    first_name = models.CharField(max_length=100, verbose_name=_('First Name'))
    middle_name = models.CharField(max_length=100, blank=True, default='', verbose_name=_('Middle Name'))
    last_name = models.CharField(max_length=100, verbose_name=_('Last Name'))
    gender = models.CharField(max_length=10, choices=[('MALE', 'Male'), ('FEMALE', 'Female'), ('OTHER', 'Other')], default='MALE')
    date_of_birth = models.DateField(verbose_name=_('Date of Birth'))
    nationality = models.CharField(max_length=50, default='Nepal', verbose_name=_('Nationality'))
    email = models.EmailField(blank=True, default='', verbose_name=_('Email'))
    phone = models.CharField(max_length=30, blank=True, default='', verbose_name=_('Phone'))
    document_type = models.CharField(max_length=30, default='PASSPORT', verbose_name=_('Document Type'))
    passport_number = models.CharField(max_length=50, blank=True, default='', verbose_name=_('Passport / ID Number'))
    passport_expiry_date = models.DateField(null=True, blank=True, verbose_name=_('Passport Expiry Date'))
    passport_issuing_country = models.CharField(max_length=50, default='Nepal', blank=True, verbose_name=_('Issuing Country'))
    meal_preference = models.CharField(max_length=30, default='STANDARD', blank=True, verbose_name=_('Meal Preference'))
    special_assistance = models.CharField(max_length=30, default='NONE', blank=True, verbose_name=_('Special Assistance'))
    seat_number = models.CharField(max_length=10, blank=True, default='', verbose_name=_('Seat Number'))

    class Meta:
        db_table = 'flight_passengers'
        verbose_name = _('Flight Passenger')
        verbose_name_plural = _('Flight Passengers')

    def __str__(self):
        return f"{self.title} {self.first_name} {self.last_name} ({self.passenger_type})"


class FlightSegment(models.Model):
    """
    Flight legs, airline operating carriers, departure/arrival schedules, and baggage rules.
    """
    id = models.BigAutoField(primary_key=True)
    booking = models.ForeignKey(
        FlightBooking,
        on_delete=models.CASCADE,
        related_name='segments',
        verbose_name=_('Booking')
    )
    airline_code = models.CharField(max_length=10, verbose_name=_('Airline Code'))
    airline_name = models.CharField(max_length=100, verbose_name=_('Airline Name'))
    flight_number = models.CharField(max_length=20, verbose_name=_('Flight Number'))
    origin = models.CharField(max_length=100, verbose_name=_('Origin'))
    destination = models.CharField(max_length=100, verbose_name=_('Destination'))
    departure_time = models.CharField(max_length=50, verbose_name=_('Departure Time'))
    arrival_time = models.CharField(max_length=50, verbose_name=_('Arrival Time'))
    duration = models.CharField(max_length=30, default='4h 30m', verbose_name=_('Duration'))
    stops = models.PositiveIntegerField(default=0, verbose_name=_('Stops'))
    cabin_class = models.CharField(max_length=30, default='ECONOMY', verbose_name=_('Cabin Class'))
    baggage_allowance = models.CharField(max_length=100, default='30 kg Check-in + 7 kg Cabin', verbose_name=_('Baggage Allowance'))

    class Meta:
        db_table = 'flight_segments'
        verbose_name = _('Flight Segment')
        verbose_name_plural = _('Flight Segments')

    def __str__(self):
        return f"{self.airline_code} {self.flight_number}: {self.origin} → {self.destination}"


class FlightTicket(models.Model):
    """
    Official 13-digit e-ticket issued through airline GDS.
    """
    id = models.BigAutoField(primary_key=True)
    booking = models.ForeignKey(
        FlightBooking,
        on_delete=models.CASCADE,
        related_name='tickets',
        verbose_name=_('Booking')
    )
    passenger = models.ForeignKey(
        FlightPassenger,
        on_delete=models.CASCADE,
        related_name='tickets',
        verbose_name=_('Passenger')
    )
    ticket_number = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        verbose_name=_('E-Ticket Number (13-Digit)')
    )
    status = models.CharField(
        max_length=20,
        choices=FlightTicketStatus.choices,
        default=FlightTicketStatus.ISSUED,
        verbose_name=_('Ticket Status')
    )
    issued_at = models.DateTimeField(null=True, blank=True, verbose_name=_('Issued At'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))

    class Meta:
        db_table = 'flight_tickets'
        verbose_name = _('Flight Ticket')
        verbose_name_plural = _('Flight Tickets')

    def __str__(self):
        return f"E-Ticket {self.ticket_number} - {self.passenger.first_name} {self.passenger.last_name} ({self.status})"


class FlightPayment(models.Model):
    """
    PCI-compliant payment transaction audit record.
    Never stores card numbers or CVV.
    """
    id = models.BigAutoField(primary_key=True)
    booking = models.ForeignKey(
        FlightBooking,
        on_delete=models.CASCADE,
        related_name='payments',
        verbose_name=_('Booking')
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='flight_payments',
        verbose_name=_('Customer')
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name=_('Amount')
    )
    currency = models.CharField(
        max_length=10,
        default='NPR',
        verbose_name=_('Currency')
    )
    provider = models.CharField(
        max_length=50,
        default='ESEWA',
        verbose_name=_('Payment Provider')
    )
    provider_reference = models.CharField(
        max_length=100,
        blank=True,
        db_index=True,
        verbose_name=_('Provider Reference')
    )
    status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
        db_index=True,
        verbose_name=_('Payment Status')
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        db_table = 'flight_payments'
        verbose_name = _('Flight Payment')
        verbose_name_plural = _('Flight Payments')

    def __str__(self):
        return f"Payment #{self.id}: NPR {self.amount} ({self.provider}) [{self.status}]"


class FlightAuditLog(models.Model):
    """
    Audit log recording lifecycle events for flight search, pricing, booking, payment, ticketing, and cancellations.
    """
    id = models.BigAutoField(primary_key=True)
    event_type = models.CharField(max_length=50, db_index=True, verbose_name=_('Event Type'))
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='flight_audit_logs',
        verbose_name=_('Actor')
    )
    booking_reference = models.CharField(max_length=100, blank=True, db_index=True, verbose_name=_('Booking Reference'))
    pnr = models.CharField(max_length=20, blank=True, db_index=True, verbose_name=_('PNR'))
    details = models.JSONField(default=dict, verbose_name=_('Details'))
    created_at = models.DateTimeField(auto_now_add=True, db_index=True, verbose_name=_('Created At'))

    class Meta:
        db_table = 'flight_audit_logs'
        verbose_name = _('Flight Audit Log')
        verbose_name_plural = _('Flight Audit Logs')
        ordering = ['-created_at']

    def __str__(self):
        return f"Audit [{self.event_type}] Ref: {self.booking_reference or self.pnr} at {self.created_at}"

