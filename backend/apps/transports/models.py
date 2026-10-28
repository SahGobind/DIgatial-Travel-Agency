"""
Nepal Roadway Transportation Models for Digital World Tour & Travels.
Supports all types of road transportation across Nepal:
- Tourist Deluxe & VIP Sofa Buses (Kathmandu, Pokhara, Chitwan, Lumbini)
- Highway Express HiAce & Force Microbuses (BP Highway, Prithvi Highway)
- Mountain & Rugged 4WD Jeeps / Scorpio / Sumo (Mustang, Manang, Solukhumbu, Kalinchowk)
- Private Intercity Cars & EV Cabs (BYD, Tata Nexon EV, Swift Dzire)
- Night Super Deluxe Sleeper & Semi-Sleeper Coaches
"""

import uuid
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class VehicleType(models.TextChoices):
    TOURIST_BUS = 'TOURIST_BUS', _('Tourist Deluxe & VIP Sofa Bus')
    MICRO_BUS = 'MICRO_BUS', _('HiAce / Force Highway Microbus')
    JEEP_4X4 = 'JEEP_4X4', _('4WD Mountain Jeep (Scorpio / Sumo / Bolero)')
    PRIVATE_CAR = 'PRIVATE_CAR', _('Private Intercity Car & EV Cab')
    NIGHT_COACH = 'NIGHT_COACH', _('Night Super Deluxe Coach')


class ShiftType(models.TextChoices):
    MORNING = 'MORNING', _('Morning / Day Shift')
    NIGHT = 'NIGHT', _('Night Shift')
    FLEXIBLE = 'FLEXIBLE', _('Flexible / On Demand (Private)')


class PricingType(models.TextChoices):
    PER_SEAT = 'PER_SEAT', _('Per Seat')
    WHOLE_VEHICLE = 'WHOLE_VEHICLE', _('Whole Vehicle Charter')


class BookingStatus(models.TextChoices):
    PENDING = 'PENDING', _('Pending')
    CONFIRMED = 'CONFIRMED', _('Confirmed')
    COMPLETED = 'COMPLETED', _('Completed')
    CANCELLED = 'CANCELLED', _('Cancelled')


class PaymentStatus(models.TextChoices):
    UNPAID = 'UNPAID', _('Unpaid')
    PAID = 'PAID', _('Paid')
    PAY_ON_BOARDING = 'PAY_ON_BOARDING', _('Pay on Boarding / Counter')


class TransportVehicle(models.Model):
    """
    Vehicle profiles operated by verified Nepal transport agencies & fleets.
    """
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=200, verbose_name=_('Vehicle Name'))
    operator_name = models.CharField(max_length=200, verbose_name=_('Operator / Agency Name'))
    vehicle_type = models.CharField(
        max_length=30,
        choices=VehicleType.choices,
        default=VehicleType.TOURIST_BUS,
        verbose_name=_('Vehicle Type')
    )
    vehicle_number = models.CharField(max_length=50, blank=True, default='', verbose_name=_('Vehicle Plate Number'))
    total_seats = models.PositiveIntegerField(default=30, verbose_name=_('Total Passenger Capacity'))
    seat_layout = models.CharField(
        max_length=50,
        default='2x2_DELUXE',
        verbose_name=_('Seat Layout (e.g. 2x1_SOFA, 2x2_DELUXE, HIACE_14, JEEP_7, CAB_4)')
    )
    amenities = models.JSONField(
        default=list,
        blank=True,
        verbose_name=_('Amenities (e.g. AC, WiFi, Charging Port, Water, Air Suspension)')
    )
    description = models.TextField(blank=True, default='', verbose_name=_('Description / Highlights'))
    image_url = models.CharField(max_length=500, blank=True, default='', verbose_name=_('Image URL'))
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=4.8, verbose_name=_('Customer Rating'))
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'transport_vehicles'
        verbose_name = _('Transport Vehicle')
        verbose_name_plural = _('Transport Vehicles')
        ordering = ['vehicle_type', 'name']

    def __str__(self):
        return f"{self.name} ({self.get_vehicle_type_display()}) - {self.operator_name}"


class TransportRoute(models.Model):
    """
    Popular highway & mountain roadway routes within Nepal.
    """
    id = models.BigAutoField(primary_key=True)
    route_name = models.CharField(max_length=255, verbose_name=_('Route Name'))
    from_city = models.CharField(max_length=100, db_index=True, verbose_name=_('Origin City / Town'))
    to_city = models.CharField(max_length=100, db_index=True, verbose_name=_('Destination City / Town'))
    highway_name = models.CharField(
        max_length=150,
        blank=True,
        default='Prithvi Highway',
        verbose_name=_('Highway / Corridor (e.g. Prithvi Hwy, BP Hwy, East-West Hwy)')
    )
    distance_km = models.PositiveIntegerField(default=200, verbose_name=_('Distance in KM'))
    estimated_duration = models.CharField(max_length=100, default='6-7 Hours', verbose_name=_('Estimated Travel Duration'))
    boarding_points = models.JSONField(
        default=list,
        blank=True,
        verbose_name=_('Designated Boarding Stops with Times')
    )
    dropping_points = models.JSONField(
        default=list,
        blank=True,
        verbose_name=_('Designated Dropping Stops')
    )
    popular_for = models.CharField(max_length=255, blank=True, default='', verbose_name=_('Popular For / Highlights'))
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'transport_routes'
        verbose_name = _('Transport Route')
        verbose_name_plural = _('Transport Routes')
        ordering = ['from_city', 'to_city']

    def __str__(self):
        return f"{self.from_city} -> {self.to_city} ({self.highway_name})"


class TransportSchedule(models.Model):
    """
    Specific departure schedules and fares for a vehicle on a route.
    """
    id = models.BigAutoField(primary_key=True)
    vehicle = models.ForeignKey(
        TransportVehicle,
        on_delete=models.CASCADE,
        related_name='schedules',
        verbose_name=_('Vehicle')
    )
    route = models.ForeignKey(
        TransportRoute,
        on_delete=models.CASCADE,
        related_name='schedules',
        verbose_name=_('Route')
    )
    departure_time = models.TimeField(verbose_name=_('Departure Time'))
    arrival_time = models.TimeField(verbose_name=_('Estimated Arrival Time'))
    shift = models.CharField(
        max_length=20,
        choices=ShiftType.choices,
        default=ShiftType.MORNING,
        verbose_name=_('Shift Type')
    )
    pricing_type = models.CharField(
        max_length=20,
        choices=PricingType.choices,
        default=PricingType.PER_SEAT,
        verbose_name=_('Pricing Mode')
    )
    fare_npr = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name=_('Fare in NPR (Per Seat or Total for Private)')
    )
    available_days = models.JSONField(
        default=list,
        blank=True,
        verbose_name=_('Operating Days (Default: All 7 Days)')
    )
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'transport_schedules'
        verbose_name = _('Transport Schedule')
        verbose_name_plural = _('Transport Schedules')
        ordering = ['departure_time', 'fare_npr']

    def __str__(self):
        return f"{self.route} | {self.vehicle.name} @ {self.departure_time.strftime('%I:%M %p')} (NPR {self.fare_npr})"


class TransportBooking(models.Model):
    """
    Customer road transportation reservation record.
    Saves all details properly to database including selected seats, boarding stop,
    Nepali contact number, and booking reference.
    """
    id = models.BigAutoField(primary_key=True)
    booking_reference = models.CharField(
        max_length=40,
        unique=True,
        db_index=True,
        verbose_name=_('Booking Reference Code')
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transport_bookings',
        verbose_name=_('Registered User (Optional)')
    )
    schedule = models.ForeignKey(
        TransportSchedule,
        on_delete=models.PROTECT,
        related_name='bookings',
        verbose_name=_('Transport Schedule')
    )
    travel_date = models.DateField(db_index=True, verbose_name=_('Date of Travel'))
    
    # Passenger Contact Information
    passenger_name = models.CharField(max_length=150, verbose_name=_('Lead Passenger Name'))
    passenger_phone = models.CharField(max_length=30, verbose_name=_('Contact Phone (Nepali Mobile)'))
    passenger_email = models.EmailField(blank=True, default='', verbose_name=_('Email Address'))
    
    # Seats and Stops
    selected_seats = models.JSONField(
        default=list,
        verbose_name=_('Selected Seats List (e.g. ["A1", "A2"])')
    )
    seat_count = models.PositiveIntegerField(default=1, verbose_name=_('Number of Seats / Passengers'))
    boarding_point = models.CharField(max_length=200, verbose_name=_('Boarding Point'))
    dropping_point = models.CharField(max_length=200, verbose_name=_('Dropping Point'))
    
    # Financials & Status
    total_amount_npr = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name=_('Total Fare in NPR')
    )
    status = models.CharField(
        max_length=30,
        choices=BookingStatus.choices,
        default=BookingStatus.CONFIRMED,
        verbose_name=_('Booking Status')
    )
    payment_status = models.CharField(
        max_length=30,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PAY_ON_BOARDING,
        verbose_name=_('Payment Status')
    )
    special_notes = models.TextField(blank=True, default='', verbose_name=_('Special Requests / Luggage Notes'))
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Booked At'))
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'transport_bookings'
        verbose_name = _('Roadway Transport Booking')
        verbose_name_plural = _('Roadway Transport Bookings')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.booking_reference} - {self.passenger_name} ({self.schedule.route.from_city} -> {self.schedule.route.to_city}) on {self.travel_date}"

    def save(self, *args, **kwargs):
        if not self.booking_reference:
            # Generate human-friendly reference e.g., DW-ROAD-84920
            clean_uuid = uuid.uuid4().hex[:6].upper()
            self.booking_reference = f"DW-ROAD-{clean_uuid}"
        super().save(*args, **kwargs)
