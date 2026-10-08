"""
Views for Flight Ticket Request Management and Fare Estimation.
"""

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied, NotFound
from rest_framework import status
from drf_spectacular.utils import extend_schema
from common.responses import success_response, error_response
from common.pagination import StandardResultsSetPagination
from .models import TicketRequest, TicketStatus
from .serializers import (
    TicketRequestSerializer,
    TicketRequestAdminUpdateSerializer,
    TicketRequestCustomerUpdateSerializer,
    TicketFareEstimateSerializer,
    FlightSearchSerializer,
    FlightRepriceSerializer,
    FlightBookingSerializer,
)
from .services import TicketService
from .flight_provider import FlightAPIProvider


class TicketRequestListCreateView(APIView):
    """
    GET /api/v1/tickets/ - List ticket requests (scoped by role: customer sees own, admin sees all)
    POST /api/v1/tickets/ - Submit a new ticket request
    """
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    @extend_schema(responses={200: TicketRequestSerializer(many=True)})
    def get(self, request):
        queryset = TicketService.get_user_queryset(request.user)
        
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        if page is not None:
            serializer = TicketRequestSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = TicketRequestSerializer(queryset, many=True)
        return success_response(
            data=serializer.data,
            message="Flight ticket requests retrieved successfully."
        )

    @extend_schema(request=TicketRequestSerializer, responses={201: TicketRequestSerializer})
    def post(self, request):
        serializer = TicketRequestSerializer(data=request.data)
        if serializer.is_valid():
            ticket = TicketService.create_ticket_request(
                user=request.user,
                validated_data=serializer.validated_data
            )
            response_serializer = TicketRequestSerializer(ticket)
            return success_response(
                data=response_serializer.data,
                message="Flight ticket request submitted successfully.",
                status_code=status.HTTP_201_CREATED
            )
        return error_response(
            errors=serializer.errors,
            message="Validation error in flight ticket request.",
            status_code=status.HTTP_400_BAD_REQUEST
        )


class TicketRequestDetailView(APIView):
    """
    GET /api/v1/tickets/{id}/ - Retrieve a ticket request detail
    PATCH /api/v1/tickets/{id}/ - Update request (Admin: status/notes/quote, Customer: details/cancel)
    DELETE /api/v1/tickets/{id}/ - Delete a ticket request
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        try:
            ticket = TicketRequest.objects.select_related('customer').get(pk=pk)
        except TicketRequest.DoesNotExist:
            raise NotFound(detail="Ticket request not found.")

        is_admin_or_staff = (
            getattr(user, 'role', None) in ['ADMIN', 'STAFF'] or
            user.is_staff or
            user.is_superuser
        )

        if not is_admin_or_staff and ticket.customer != user:
            raise PermissionDenied("You do not have permission to access this ticket request.")

        return ticket

    @extend_schema(responses={200: TicketRequestSerializer})
    def get(self, request, pk):
        ticket = self.get_object(pk, request.user)
        serializer = TicketRequestSerializer(ticket)
        return success_response(
            data=serializer.data,
            message="Ticket request details retrieved successfully."
        )

    @extend_schema(request=TicketRequestAdminUpdateSerializer, responses={200: TicketRequestSerializer})
    def patch(self, request, pk):
        ticket = self.get_object(pk, request.user)
        is_admin_or_staff = (
            getattr(request.user, 'role', None) in ['ADMIN', 'STAFF'] or
            request.user.is_staff or
            request.user.is_superuser
        )

        if is_admin_or_staff:
            serializer = TicketRequestAdminUpdateSerializer(ticket, data=request.data, partial=True)
        else:
            serializer = TicketRequestCustomerUpdateSerializer(ticket, data=request.data, partial=True)

        if serializer.is_valid():
            updated_ticket = serializer.save()
            response_serializer = TicketRequestSerializer(updated_ticket)
            return success_response(
                data=response_serializer.data,
                message="Ticket request updated successfully."
            )
        return error_response(
            errors=serializer.errors,
            message="Failed to update ticket request.",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    @extend_schema(responses={200: dict})
    def delete(self, request, pk):
        ticket = self.get_object(pk, request.user)
        ticket.delete()
        return success_response(
            data={},
            message="Ticket request deleted successfully."
        )


class TicketFareEstimateView(APIView):
    """
    POST /api/v1/tickets/estimate/ - Get quick flight fare estimate
    """
    permission_classes = [AllowAny]
    serializer_class = TicketFareEstimateSerializer

    @extend_schema(request=TicketFareEstimateSerializer)
    def post(self, request):
        serializer = TicketFareEstimateSerializer(data=request.data)
        if serializer.is_valid():
            estimate = TicketService.calculate_fare_estimate(**serializer.validated_data)
            return success_response(
                data=estimate,
                message="Fare estimate calculated successfully."
            )
        return error_response(
            errors=serializer.errors,
            message="Invalid estimation parameters."
        )


class FlightSearchAPIView(APIView):
    """
    POST /api/v1/tickets/search/ - Search live flight offers across airlines via Flight API Provider
    """
    permission_classes = [AllowAny]

    @extend_schema(request=FlightSearchSerializer)
    def post(self, request):
        serializer = FlightSearchSerializer(data=request.data)
        if serializer.is_valid():
            results = FlightAPIProvider.search_flights(
                origin=serializer.validated_data['origin'],
                destination=serializer.validated_data['destination'],
                departure_date=serializer.validated_data['departure_date'],
                return_date=serializer.validated_data.get('return_date'),
                adults=serializer.validated_data.get('adults', 1),
                children=serializer.validated_data.get('children', 0),
                cabin_class=serializer.validated_data.get('cabin_class', 'ECONOMY'),
                trip_type=serializer.validated_data.get('trip_type', 'ONE_WAY'),
            )
            return success_response(
                data=results,
                message="Live flight offers retrieved successfully."
            )
        return error_response(
            errors=serializer.errors,
            message="Invalid flight search parameters.",
            status_code=status.HTTP_400_BAD_REQUEST
        )


class FlightRepriceAPIView(APIView):
    """
    POST /api/v1/tickets/reprice/ - Re-price and lock flight offer
    """
    permission_classes = [AllowAny]

    @extend_schema(request=FlightRepriceSerializer)
    def post(self, request):
        serializer = FlightRepriceSerializer(data=request.data)
        if serializer.is_valid():
            offer_id = serializer.validated_data['offer_id']
            price_data = serializer.validated_data.get('price_data')
            reprice_result = FlightAPIProvider.reprice_offer(offer_id, price_data)
            return success_response(
                data=reprice_result,
                message="Flight offer confirmed and locked."
            )
        return error_response(
            errors=serializer.errors,
            message="Invalid offer re-pricing request.",
            status_code=status.HTTP_400_BAD_REQUEST
        )


class FlightBookAPIView(APIView):
    """
    POST /api/v1/tickets/book/ - Book confirmed flight offer and generate PNR / E-Ticket
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(request=FlightBookingSerializer)
    def post(self, request):
        serializer = FlightBookingSerializer(data=request.data)
        if serializer.is_valid():
            val = serializer.validated_data
            
            # 1. Call GDS / Flight API Provider to create booking & PNR
            gds_booking = FlightAPIProvider.create_booking(
                offer_id=val['offer_id'],
                passenger_details=val['passengers'],
                user=request.user
            )

            # 2. Persist in local database as a Confirmed Ticket Request
            pax_names = ", ".join([f"{p['first_name']} {p['last_name']}" for p in val['passengers']])
            pnr = gds_booking['pnr']
            ticket_nums = ", ".join([t['ticket_number'] for t in gds_booking['tickets']])

            special_req = val.get('special_request', '')
            admin_note = f"Auto-Booked via Flight API Provider.\nPNR: {pnr}\nE-Tickets: {ticket_nums}\nPassengers: {pax_names}\nPayment Ref: {val.get('payment_reference', 'CONFIRMED')}"

            ticket_record = TicketRequest.objects.create(
                customer=request.user,
                trip_type=val['trip_type'],
                from_location=val['from_location'],
                to_location=val['to_location'],
                departure_date=val['departure_date'],
                return_date=val.get('return_date'),
                adults=len(val['passengers']),
                children=0,
                travel_class=val['travel_class'],
                special_request=f"{special_req}\n[PNR: {pnr}]".strip(),
                status=TicketStatus.CONFIRMED,
                admin_notes=admin_note,
                quotation_amount_npr=val['total_amount'],
            )

            response_data = {
                "booking": gds_booking,
                "ticket_request_id": ticket_record.id,
                "total_amount": float(val['total_amount']),
                "currency": "NPR",
                "customer_email": request.user.email,
            }

            return success_response(
                data=response_data,
                message=f"Flight booked successfully! PNR: {pnr}",
                status_code=status.HTTP_201_CREATED
            )
        return error_response(
            errors=serializer.errors,
            message="Invalid flight booking payload.",
            status_code=status.HTTP_400_BAD_REQUEST
        )

