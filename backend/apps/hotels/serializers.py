"""
Serializers for Hotel and HotelBooking APIs.
"""

from rest_framework import serializers
from django.utils import timezone
from .models import Hotel, HotelBooking, HotelBookingStatus
from apps.users.serializers import UserResponseSerializer


class HotelSerializer(serializers.ModelSerializer):
    """
    Serializer for browsing and managing Hotel properties.
    """
    class Meta:
        model = Hotel
        fields = [
            'id',
            'name',
            'location',
            'country',
            'description',
            'rating',
            'price_per_night',
            'amenities',
            'image',
            'is_active',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class HotelBookingSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and retrieving hotel reservations.
    """
    customer_details = UserResponseSerializer(source='customer', read_only=True)
    hotel_details = HotelSerializer(source='hotel', read_only=True)
    hotel_id = serializers.PrimaryKeyRelatedField(
        queryset=Hotel.objects.filter(is_active=True),
        source='hotel',
        write_only=True
    )
    status = serializers.ChoiceField(choices=HotelBookingStatus.choices, default=HotelBookingStatus.PENDING, read_only=True)
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)

    class Meta:
        model = HotelBooking
        fields = [
            'id',
            'customer',
            'customer_details',
            'hotel',
            'hotel_id',
            'hotel_details',
            'check_in',
            'check_out',
            'guests',
            'rooms',
            'status',
            'total_amount',
            'special_requests',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'customer', 'customer_details', 'hotel', 'hotel_details', 'status', 'created_at', 'updated_at']

    def validate_check_in(self, value):
        today = timezone.now().date()
        if value < today:
            raise serializers.ValidationError("Check-in date cannot be in the past.")
        return value

    def validate_guests(self, value):
        if value < 1:
            raise serializers.ValidationError("Guests count must be at least 1.")
        return value

    def validate_rooms(self, value):
        if value < 1:
            raise serializers.ValidationError("Rooms count must be at least 1.")
        return value

    def validate(self, attrs):
        check_in = attrs.get('check_in')
        check_out = attrs.get('check_out')

        if check_in and check_out:
            if check_out <= check_in:
                raise serializers.ValidationError({"check_out": "Check-out date must be after check-in date."})
            
            # Automatically calculate total amount based on price_per_night * nights * rooms if not manually supplied
            hotel = attrs.get('hotel')
            if hotel:
                nights = (check_out - check_in).days
                rooms = attrs.get('rooms', 1)
                calculated_total = hotel.price_per_night * nights * rooms
                if 'total_amount' not in attrs or not attrs['total_amount']:
                    attrs['total_amount'] = calculated_total
        return attrs


class HotelBookingUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating status of hotel bookings.
    """
    status = serializers.ChoiceField(choices=HotelBookingStatus.choices, required=False)

    class Meta:
        model = HotelBooking
        fields = ['status', 'special_requests']
