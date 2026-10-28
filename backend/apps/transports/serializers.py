"""
Serializers for Nepal Roadway Transportation endpoints.
"""

from rest_framework import serializers
from .models import (
    TransportVehicle,
    TransportRoute,
    TransportSchedule,
    TransportBooking,
    VehicleType,
    ShiftType,
    PricingType,
    BookingStatus,
    PaymentStatus,
)


class TransportVehicleSerializer(serializers.ModelSerializer):
    vehicle_type_display = serializers.CharField(source='get_vehicle_type_display', read_only=True)

    class Meta:
        model = TransportVehicle
        fields = [
            'id',
            'name',
            'operator_name',
            'vehicle_type',
            'vehicle_type_display',
            'vehicle_number',
            'total_seats',
            'seat_layout',
            'amenities',
            'description',
            'image_url',
            'rating',
            'is_active',
        ]


class TransportRouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportRoute
        fields = [
            'id',
            'route_name',
            'from_city',
            'to_city',
            'highway_name',
            'distance_km',
            'estimated_duration',
            'boarding_points',
            'dropping_points',
            'popular_for',
            'is_active',
        ]


class TransportScheduleSerializer(serializers.ModelSerializer):
    vehicle = TransportVehicleSerializer(read_only=True)
    route = TransportRouteSerializer(read_only=True)
    shift_display = serializers.CharField(source='get_shift_display', read_only=True)
    pricing_type_display = serializers.CharField(source='get_pricing_type_display', read_only=True)
    occupied_seats = serializers.SerializerMethodField()
    available_seats_count = serializers.SerializerMethodField()

    class Meta:
        model = TransportSchedule
        fields = [
            'id',
            'vehicle',
            'route',
            'departure_time',
            'arrival_time',
            'shift',
            'shift_display',
            'pricing_type',
            'pricing_type_display',
            'fare_npr',
            'available_days',
            'is_active',
            'occupied_seats',
            'available_seats_count',
        ]

    def get_occupied_seats(self, obj):
        travel_date = self.context.get('travel_date')
        if not travel_date:
            return []
        
        # Query existing active bookings for this schedule & travel date
        bookings = TransportBooking.objects.filter(
            schedule=obj,
            travel_date=travel_date,
            status__in=[BookingStatus.PENDING, BookingStatus.CONFIRMED]
        )
        occupied = []
        for b in bookings:
            if isinstance(b.selected_seats, list):
                occupied.extend(b.selected_seats)
        return list(set(occupied))

    def get_available_seats_count(self, obj):
        occupied = self.get_occupied_seats(obj)
        total = obj.vehicle.total_seats
        return max(0, total - len(occupied))


class TransportBookingSerializer(serializers.ModelSerializer):
    schedule = TransportScheduleSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)

    class Meta:
        model = TransportBooking
        fields = [
            'id',
            'booking_reference',
            'customer',
            'schedule',
            'travel_date',
            'passenger_name',
            'passenger_phone',
            'passenger_email',
            'selected_seats',
            'seat_count',
            'boarding_point',
            'dropping_point',
            'total_amount_npr',
            'status',
            'status_display',
            'payment_status',
            'payment_status_display',
            'special_notes',
            'created_at',
            'updated_at',
        ]


class TransportBookingCreateSerializer(serializers.ModelSerializer):
    schedule_id = serializers.PrimaryKeyRelatedField(
        queryset=TransportSchedule.objects.filter(is_active=True),
        source='schedule',
        write_only=True
    )

    class Meta:
        model = TransportBooking
        fields = [
            'schedule_id',
            'travel_date',
            'passenger_name',
            'passenger_phone',
            'passenger_email',
            'selected_seats',
            'seat_count',
            'boarding_point',
            'dropping_point',
            'special_notes',
            'payment_status',
        ]

    def validate_passenger_phone(self, value):
        cleaned = value.strip().replace(' ', '').replace('-', '')
        if len(cleaned) < 8:
            raise serializers.ValidationError("Please provide a valid contact phone number.")
        return cleaned

    def validate(self, data):
        schedule = data.get('schedule')
        travel_date = data.get('travel_date')
        selected_seats = data.get('selected_seats', [])
        seat_count = data.get('seat_count') or len(selected_seats) or 1

        if not selected_seats:
            if schedule.pricing_type == PricingType.WHOLE_VEHICLE:
                selected_seats = ["Full Vehicle"]
            else:
                raise serializers.ValidationError({
                    'selected_seats': "Please select at least one seat."
                })

        # Check if any seat is already booked for this schedule on this date
        if schedule.pricing_type != PricingType.WHOLE_VEHICLE:
            existing_bookings = TransportBooking.objects.filter(
                schedule=schedule,
                travel_date=travel_date,
                status__in=[BookingStatus.PENDING, BookingStatus.CONFIRMED]
            )
            already_booked = set()
            for b in existing_bookings:
                if isinstance(b.selected_seats, list):
                    already_booked.update(b.selected_seats)

            conflicts = [seat for seat in selected_seats if seat in already_booked]
            if conflicts:
                raise serializers.ValidationError({
                    'selected_seats': f"The following seat(s) are already booked for this departure: {', '.join(conflicts)}"
                })

        data['selected_seats'] = selected_seats
        data['seat_count'] = len(selected_seats) if schedule.pricing_type != PricingType.WHOLE_VEHICLE else 1

        # Calculate total amount
        if schedule.pricing_type == PricingType.WHOLE_VEHICLE:
            data['total_amount_npr'] = schedule.fare_npr
        else:
            data['total_amount_npr'] = schedule.fare_npr * data['seat_count']

        return data

