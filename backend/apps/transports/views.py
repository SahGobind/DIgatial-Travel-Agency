"""
API Views for Nepal Roadway Transportation endpoints.
"""

from datetime import date
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiParameter

from common.responses import success_response, error_response
from common.pagination import StandardResultsSetPagination
from common.permissions import IsAdminOrReadOnly

from .models import (
    TransportVehicle,
    TransportRoute,
    TransportSchedule,
    TransportBooking,
    VehicleType,
    BookingStatus,
)
from .serializers import (
    TransportVehicleSerializer,
    TransportRouteSerializer,
    TransportScheduleSerializer,
    TransportBookingSerializer,
    TransportBookingCreateSerializer,
)
from .services import TransportService


class TransportTypesView(APIView):
    """
    GET /api/v1/transports/types/
    List all vehicle types operating across Nepal with descriptions and fleet count.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        types = []
        for key, label in VehicleType.choices:
            count = TransportVehicle.objects.filter(vehicle_type=key, is_active=True).count()
            types.append({
                'id': key,
                'name': label,
                'count': count
            })
        return success_response(data=types, message="Nepal transport types retrieved successfully.")


class TransportRoutesListView(APIView):
    """
    GET /api/v1/transports/routes/
    List all available road corridors and distinct origin/destination hubs in Nepal.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        # Auto-seed if empty
        if not TransportRoute.objects.exists():
            TransportService.seed_initial_nepal_transport()

        routes = TransportRoute.objects.filter(is_active=True).order_by('from_city', 'to_city')
        from_cities = list(routes.values_list('from_city', flat=True).distinct())
        to_cities = list(routes.values_list('to_city', flat=True).distinct())

        serializer = TransportRouteSerializer(routes, many=True)
        return success_response(
            data={
                'from_cities': sorted(from_cities),
                'to_cities': sorted(to_cities),
                'routes': serializer.data
            },
            message="Nepal routes retrieved successfully."
        )


class TransportScheduleSearchView(APIView):
    """
    GET /api/v1/transports/search/
    Search roadway schedules by origin, destination, travel date, vehicle type and shift.
    """
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination

    @extend_schema(
        parameters=[
            OpenApiParameter('from_city', str, description='Origin City (e.g. Kathmandu)'),
            OpenApiParameter('to_city', str, description='Destination City (e.g. Pokhara)'),
            OpenApiParameter('vehicle_type', str, description='Vehicle Type (TOURIST_BUS, MICRO_BUS, JEEP_4X4, etc.)'),
            OpenApiParameter('shift', str, description='Shift (MORNING, NIGHT)'),
            OpenApiParameter('date', str, description='Travel Date (YYYY-MM-DD)'),
        ],
        responses={200: TransportScheduleSerializer(many=True)}
    )
    def get(self, request):
        # If database is fresh, automatically populate Nepal transport network
        if not TransportSchedule.objects.exists():
            TransportService.seed_initial_nepal_transport()

        from_city = request.query_params.get('from_city')
        to_city = request.query_params.get('to_city')
        vehicle_type = request.query_params.get('vehicle_type')
        shift = request.query_params.get('shift')
        travel_date_str = request.query_params.get('date')

        travel_date = None
        if travel_date_str:
            try:
                travel_date = date.fromisoformat(travel_date_str)
            except ValueError:
                pass

        queryset = TransportService.search_schedules(
            from_city=from_city,
            to_city=to_city,
            vehicle_type=vehicle_type,
            shift=shift,
            travel_date=travel_date
        )

        serializer_context = {'request': request, 'travel_date': travel_date}

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        if page is not None:
            serializer = TransportScheduleSerializer(page, many=True, context=serializer_context)
            return paginator.get_paginated_response(serializer.data)

        serializer = TransportScheduleSerializer(queryset, many=True, context=serializer_context)
        return success_response(
            data=serializer.data,
            message="Available roadway transport departures retrieved successfully."
        )


class TransportScheduleDetailView(APIView):
    """
    GET /api/v1/transports/schedules/{id}/
    Retrieve schedule details with seat map and current occupied seats for the given date.
    """
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            schedule = TransportSchedule.objects.select_related('vehicle', 'route').get(pk=pk, is_active=True)
        except TransportSchedule.DoesNotExist:
            raise NotFound("Transport schedule not found.")

        travel_date_str = request.query_params.get('date')
        travel_date = None
        if travel_date_str:
            try:
                travel_date = date.fromisoformat(travel_date_str)
            except ValueError:
                pass

        serializer = TransportScheduleSerializer(schedule, context={'travel_date': travel_date})
        return success_response(data=serializer.data, message="Schedule details retrieved successfully.")


class TransportBookingListCreateView(APIView):
    """
    GET /api/v1/transports/bookings/ - List bookings (user's own, or filtered by phone/ref, or all for admin)
    POST /api/v1/transports/bookings/ - Create roadway transport booking (authenticated user or guest)
    """
    pagination_class = StandardResultsSetPagination

    def get_permissions(self):
        # Guests can look up booking by reference or phone, while POST is open to all travellers
        return [AllowAny()]

    @extend_schema(responses={200: TransportBookingSerializer(many=True)})
    def get(self, request):
        user = request.user
        ref = request.query_params.get('reference')
        phone = request.query_params.get('phone')

        queryset = TransportBooking.objects.select_related(
            'schedule', 'schedule__vehicle', 'schedule__route', 'customer'
        ).order_by('-created_at')

        # Filter permissions:
        if user and user.is_authenticated and (getattr(user, 'role', '') in ['ADMIN', 'STAFF'] or user.is_staff):
            pass # staff can view all
        elif user and user.is_authenticated:
            queryset = queryset.filter(customer=user)
        elif ref:
            queryset = queryset.filter(booking_reference__iexact=ref.strip())
        elif phone:
            cleaned_phone = phone.strip().replace(' ', '').replace('-', '')
            queryset = queryset.filter(passenger_phone__icontains=cleaned_phone)
        else:
            return error_response(
                message="Please log in or provide a booking reference / contact phone to lookup your reservations.",
                status_code=status.HTTP_401_UNAUTHORIZED
            )

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        if page is not None:
            serializer = TransportBookingSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = TransportBookingSerializer(queryset, many=True)
        return success_response(data=serializer.data, message="Roadway bookings retrieved successfully.")

    @extend_schema(request=TransportBookingCreateSerializer, responses={201: TransportBookingSerializer})
    def post(self, request):
        serializer = TransportBookingCreateSerializer(data=request.data)
        if serializer.is_valid():
            booking = TransportService.create_booking(
                user=request.user if request.user.is_authenticated else None,
                validated_data=serializer.validated_data
            )
            return success_response(
                data=TransportBookingSerializer(booking).data,
                message=f"Booking confirmed successfully! Your reference is {booking.booking_reference}.",
                status_code=status.HTTP_201_CREATED
            )
        return error_response(
            errors=serializer.errors,
            message="Failed to book roadway transport. Please check the provided information."
        )


class TransportBookingDetailView(APIView):
    """
    GET /api/v1/transports/bookings/{ref_or_pk}/ - Retrieve booking details
    PATCH /api/v1/transports/bookings/{ref_or_pk}/ - Cancel / update booking
    """
    permission_classes = [AllowAny]

    def _get_booking(self, identifier):
        if str(identifier).isdigit():
            return TransportBooking.objects.select_related(
                'schedule', 'schedule__vehicle', 'schedule__route'
            ).get(pk=int(identifier))
        return TransportBooking.objects.select_related(
            'schedule', 'schedule__vehicle', 'schedule__route'
        ).get(booking_reference__iexact=str(identifier).strip())

    def get(self, request, identifier):
        try:
            booking = self._get_booking(identifier)
        except TransportBooking.DoesNotExist:
            raise NotFound("Transport booking not found.")

        serializer = TransportBookingSerializer(booking)
        return success_response(data=serializer.data, message="Booking details retrieved successfully.")

    def patch(self, request, identifier):
        try:
            booking = self._get_booking(identifier)
        except TransportBooking.DoesNotExist:
            raise NotFound("Transport booking not found.")

        # Check cancel authorization
        action = request.data.get('action')
        if action == 'cancel':
            booking.status = BookingStatus.CANCELLED
            booking.save(update_fields=['status', 'updated_at'])
            return success_response(
                data=TransportBookingSerializer(booking).data,
                message="Booking has been cancelled successfully."
            )

        # Admin status update
        new_status = request.data.get('status')
        if new_status and new_status in BookingStatus.values:
            booking.status = new_status
            booking.save(update_fields=['status', 'updated_at'])
            return success_response(
                data=TransportBookingSerializer(booking).data,
                message=f"Booking status updated to {new_status}."
            )

        return error_response(message="Invalid update request.")


class SeedNepalTransportsView(APIView):
    """
    POST /api/v1/transports/seed/
    Seed or reset official Nepal road transport data.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        result = TransportService.seed_initial_nepal_transport()
        return success_response(data=result, message="Nepal roadway transport database populated.")

