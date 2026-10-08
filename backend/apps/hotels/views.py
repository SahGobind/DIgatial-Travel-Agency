"""
Views for Hotels and Hotel Bookings endpoints.
"""

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied, NotFound
from rest_framework import status
from drf_spectacular.utils import extend_schema
from common.responses import success_response, error_response
from common.pagination import StandardResultsSetPagination
from common.permissions import IsAdminOrReadOnly
from .models import Hotel, HotelBooking
from .serializers import (
    HotelSerializer,
    HotelBookingSerializer,
    HotelBookingUpdateSerializer,
)
from .services import HotelService


class HotelListCreateView(APIView):
    """
    GET /api/v1/hotels/ - Browse available hotels (Public)
    POST /api/v1/hotels/ - Add new hotel (Admin only)
    """
    pagination_class = StandardResultsSetPagination
    serializer_class = HotelSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminOrReadOnly()]

    @extend_schema(responses={200: HotelSerializer(many=True)})
    def get(self, request):
        city = request.query_params.get('city')
        country = request.query_params.get('country')
        queryset = HotelService.get_hotels(request.user, city=city, country=country)

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        if page is not None:
            serializer = HotelSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = HotelSerializer(queryset, many=True)
        return success_response(data=serializer.data, message="Hotels list retrieved successfully.")

    @extend_schema(request=HotelSerializer, responses={201: HotelSerializer})
    def post(self, request):
        serializer = HotelSerializer(data=request.data)
        if serializer.is_valid():
            hotel = serializer.save()
            return success_response(
                data=HotelSerializer(hotel).data,
                message="Hotel created successfully.",
                status_code=status.HTTP_201_CREATED
            )
        return error_response(errors=serializer.errors, message="Failed to create hotel.")


class HotelDetailView(APIView):
    """
    GET /api/v1/hotels/{id}/ - Retrieve hotel details (Public)
    PATCH /api/v1/hotels/{id}/ - Update hotel details (Admin only)
    """
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminOrReadOnly()]

    @extend_schema(responses={200: HotelSerializer})
    def get(self, request, pk):
        try:
            hotel = Hotel.objects.get(pk=pk)
        except Hotel.DoesNotExist:
            raise NotFound(detail="Hotel not found.")

        serializer = HotelSerializer(hotel)
        return success_response(data=serializer.data, message="Hotel details retrieved successfully.")

    @extend_schema(request=HotelSerializer, responses={200: HotelSerializer})
    def patch(self, request, pk):
        try:
            hotel = Hotel.objects.get(pk=pk)
        except Hotel.DoesNotExist:
            raise NotFound(detail="Hotel not found.")

        serializer = HotelSerializer(hotel, data=request.data, partial=True)
        if serializer.is_valid():
            updated_hotel = serializer.save()
            return success_response(data=HotelSerializer(updated_hotel).data, message="Hotel updated successfully.")
        return error_response(errors=serializer.errors, message="Failed to update hotel.")


class HotelBookingListCreateView(APIView):
    """
    GET /api/v1/hotel-bookings/ - List bookings (Customer sees own, Admin sees all)
    POST /api/v1/hotel-bookings/ - Create a hotel booking
    """
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    serializer_class = HotelBookingSerializer

    @extend_schema(responses={200: HotelBookingSerializer(many=True)})
    def get(self, request):
        queryset = HotelService.get_bookings_queryset(request.user)

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        if page is not None:
            serializer = HotelBookingSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = HotelBookingSerializer(queryset, many=True)
        return success_response(data=serializer.data, message="Hotel bookings retrieved successfully.")

    @extend_schema(request=HotelBookingSerializer, responses={201: HotelBookingSerializer})
    def post(self, request):
        serializer = HotelBookingSerializer(data=request.data)
        if serializer.is_valid():
            booking = HotelService.create_booking(
                user=request.user,
                validated_data=serializer.validated_data
            )
            return success_response(
                data=HotelBookingSerializer(booking).data,
                message="Hotel reservation created successfully.",
                status_code=status.HTTP_201_CREATED
            )
        return error_response(
            errors=serializer.errors,
            message="Booking validation error.",
            status_code=status.HTTP_400_BAD_REQUEST
        )


class HotelBookingDetailView(APIView):
    """
    GET /api/v1/hotel-bookings/{id}/ - Retrieve hotel booking details
    PATCH /api/v1/hotel-bookings/{id}/ - Update booking status
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        try:
            booking = HotelBooking.objects.select_related('customer', 'hotel').get(pk=pk)
        except HotelBooking.DoesNotExist:
            raise NotFound(detail="Hotel booking not found.")

        is_admin_or_staff = (
            getattr(user, 'role', None) in ['ADMIN', 'STAFF'] or
            user.is_staff or
            user.is_superuser
        )

        if not is_admin_or_staff and booking.customer != user:
            raise PermissionDenied("You do not have permission to access this hotel booking.")

        return booking

    @extend_schema(responses={200: HotelBookingSerializer})
    def get(self, request, pk):
        booking = self.get_object(pk, request.user)
        serializer = HotelBookingSerializer(booking)
        return success_response(data=serializer.data, message="Hotel booking details retrieved successfully.")

    @extend_schema(request=HotelBookingUpdateSerializer, responses={200: HotelBookingSerializer})
    def patch(self, request, pk):
        booking = self.get_object(pk, request.user)
        serializer = HotelBookingUpdateSerializer(booking, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            return success_response(data=HotelBookingSerializer(updated).data, message="Hotel booking updated successfully.")
        return error_response(errors=serializer.errors, message="Failed to update hotel booking.")
