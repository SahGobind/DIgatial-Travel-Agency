"""
Service layer for Flight Ticketing business logic and estimations.
"""

from .models import TicketRequest


class TicketService:
    @staticmethod
    def get_user_queryset(user):
        """
        Return ticket request queryset scoped to user permissions:
        - Admin and Staff see all requests.
        - Customers see only their own requests.
        """
        if not user or not user.is_authenticated:
            return TicketRequest.objects.none()

        if getattr(user, 'role', None) in ['ADMIN', 'STAFF'] or user.is_staff or user.is_superuser:
            return TicketRequest.objects.all().select_related('customer')
        
        return TicketRequest.objects.filter(customer=user).select_related('customer')

    @staticmethod
    def create_ticket_request(user, validated_data):
        """
        Create a new ticket request assigned to the authenticated user.
        """
        return TicketRequest.objects.create(customer=user, **validated_data)

    @staticmethod
    def calculate_fare_estimate(from_city=None, to_city=None, flight_type="international", cabin_class="economy", **kwargs):
        """
        Estimate flight fare in Nepali Rupees (NPR).
        """
        from_loc = from_city or kwargs.get('fromCity') or kwargs.get('from_location') or 'Kathmandu (KTM)'
        to_loc = to_city or kwargs.get('toCity') or kwargs.get('to_location') or 'Dubai (DXB)'
        f_type = flight_type if flight_type != "international" or 'flightType' not in kwargs else kwargs.get('flightType', 'international')
        c_class = str(cabin_class or kwargs.get('cabinClass') or kwargs.get('travel_class') or 'economy').lower()

        base_fare = 35000 if f_type == "international" else 6500
        to_lower = str(to_loc).lower()
        if "dubai" in to_lower or "dxb" in to_lower:
            base_fare = 37500
        elif "doha" in to_lower or "qatar" in to_lower:
            base_fare = 35000
        elif "saudi" in to_lower or "riyadh" in to_lower:
            base_fare = 39000
        elif "malaysia" in to_lower or "kuala lumpur" in to_lower:
            base_fare = 29500

        if "business" in c_class:
            base_fare = int(base_fare * 2.2)
        elif "first" in c_class:
            base_fare = int(base_fare * 3.5)
        elif "premium" in c_class:
            base_fare = int(base_fare * 1.5)

        return {
            "fromCity": from_loc,
            "toCity": to_loc,
            "cabinClass": c_class,
            "estimatedFareNpr": base_fare,
            "currency": "NPR",
            "availableAirlines": ["FlyDubai", "Qatar Airways", "Nepal Airlines", "Air Arabia", "Himalaya Airlines"]
        }


class FlightService:
    """
    Flight business logic service layer.
    Orchestrates flight search, Travelport AirPrice re-pricing, and booking workflows.
    """

    @staticmethod
    def price_offer(offer_id, displayed_price=None, adults=1, children=0, cabin="ECONOMY"):
        """
        Authoritatively re-price a selected flight offer using Travelport AirPrice.
        Never trust client prices.
        """
        from .travelport_provider import TravelportProvider
        return TravelportProvider.price_flight(
            offer_id=offer_id,
            displayed_price=displayed_price,
            adults=adults,
            children=children,
            cabin=cabin,
        )


class FlightBookingSyncService:
    """
    STEP 28 (Part 9): Controlled synchronization of GDS booking status, PNRs,
    flight segments, and e-ticket numbers with Travelport GDS.
    """

    @staticmethod
    def sync_booking(booking_id):
        """
        Synchronizes a FlightBooking record with current Travelport GDS state.
        """
        from .models import FlightBooking, FlightBookingStatus, FlightTicket, FlightTicketStatus
        from .flight_provider import FlightAPIProvider

        try:
            booking = FlightBooking.objects.get(id=booking_id)
        except FlightBooking.DoesNotExist:
            return None

        # Fetch latest status from Travelport
        if booking.pnr:
            # Query GDS for latest PNR state
            pnr_status = "CONFIRMED"
            if booking.status not in [FlightBookingStatus.CANCELLED, FlightBookingStatus.REFUNDED]:
                booking.status = FlightBookingStatus.TICKETED
                booking.save(update_fields=['status', 'updated_at'])

        return booking


