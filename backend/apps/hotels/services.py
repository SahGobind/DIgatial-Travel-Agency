"""
Service layer for Hotels and Hotel Bookings business logic.
"""

from .models import Hotel, HotelBooking


class HotelService:
    @staticmethod
    def get_hotels(user=None, city=None, country=None):
        """
        Return active hotels for public/customer, or all for admin.
        """
        queryset = Hotel.objects.all()
        if not user or not (getattr(user, 'role', None) in ['ADMIN', 'STAFF'] or getattr(user, 'is_staff', False)):
            queryset = queryset.filter(is_active=True)

        if city:
            queryset = queryset.filter(location__icontains=city)
        if country:
            queryset = queryset.filter(country__icontains=country)

        return queryset

    @staticmethod
    def get_bookings_queryset(user):
        """
        Return bookings scoped by permissions:
        - Admin and Staff see all bookings.
        - Customers see only their own bookings.
        """
        if not user or not user.is_authenticated:
            return HotelBooking.objects.none()

        if getattr(user, 'role', None) in ['ADMIN', 'STAFF'] or user.is_staff or user.is_superuser:
            return HotelBooking.objects.all().select_related('customer', 'hotel')

        return HotelBooking.objects.filter(customer=user).select_related('customer', 'hotel')

    @staticmethod
    def create_booking(user, validated_data):
        """
        Create a new hotel reservation for the customer.
        """
        return HotelBooking.objects.create(customer=user, **validated_data)
