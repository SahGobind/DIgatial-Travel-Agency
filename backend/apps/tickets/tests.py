"""
Comprehensive tests for Flight Ticket Request API: CRUD, Scoping, Validation, Permissions.
"""

from datetime import timedelta
from django.test import TestCase
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import TicketRequest, TripType, TravelClass, TicketStatus

User = get_user_model()


class TicketRequestApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.today = timezone.now().date()
        self.dep_date = self.today + timedelta(days=10)
        self.ret_date = self.today + timedelta(days=20)

        # Create Customer 1
        self.customer1 = User.objects.create_user(
            email="cust1@example.com",
            full_name="Customer One",
            role="CUSTOMER",
            phone="+977 9811111111",
            password="Password123!"
        )

        # Create Customer 2
        self.customer2 = User.objects.create_user(
            email="cust2@example.com",
            full_name="Customer Two",
            role="CUSTOMER",
            phone="+977 9822222222",
            password="Password123!"
        )

        # Create Admin
        self.admin = User.objects.create_user(
            email="admin@example.com",
            full_name="Admin Staff",
            role="ADMIN",
            is_staff=True,
            password="Password123!"
        )

        self.list_create_url = '/api/v1/tickets/'

    def test_create_ticket_request_one_way_success(self):
        """Test authenticated customer successfully creating a one-way ticket request."""
        self.client.force_authenticate(user=self.customer1)
        payload = {
            "trip_type": "ONE_WAY",
            "from_location": "Kathmandu (KTM)",
            "to_location": "Dubai (DXB)",
            "departure_date": str(self.dep_date),
            "adults": 2,
            "children": 1,
            "travel_class": "ECONOMY",
            "special_request": "Vegetarian meal required"
        }
        response = self.client.post(self.list_create_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['from_location'], "Kathmandu (KTM)")
        self.assertEqual(data['data']['to_location'], "Dubai (DXB)")
        self.assertEqual(data['data']['status'], "PENDING")
        self.assertEqual(data['data']['customer_details']['email'], "cust1@example.com")
        self.assertIsNone(data['data']['return_date'])

    def test_create_ticket_request_round_trip_success(self):
        """Test authenticated customer creating a round-trip ticket request."""
        self.client.force_authenticate(user=self.customer1)
        payload = {
            "trip_type": "ROUND_TRIP",
            "from_location": "Janakpur (JKR)",
            "to_location": "Kathmandu (KTM)",
            "departure_date": str(self.dep_date),
            "return_date": str(self.ret_date),
            "adults": 1,
            "children": 0,
            "travel_class": "BUSINESS"
        }
        response = self.client.post(self.list_create_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.json()
        self.assertEqual(data['data']['trip_type'], "ROUND_TRIP")
        self.assertEqual(data['data']['return_date'], str(self.ret_date))

    def test_list_ticket_requests_customer_isolation(self):
        """Test customer only sees their own requests, not another customer's."""
        # Create ticket for Customer 1
        TicketRequest.objects.create(
            customer=self.customer1,
            trip_type=TripType.ONE_WAY,
            from_location="KTM",
            to_location="DXB",
            departure_date=self.dep_date
        )
        # Create ticket for Customer 2
        TicketRequest.objects.create(
            customer=self.customer2,
            trip_type=TripType.ONE_WAY,
            from_location="KTM",
            to_location="DOH",
            departure_date=self.dep_date
        )

        # Login as Customer 1
        self.client.force_authenticate(user=self.customer1)
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()['data']
        # Depending on pagination, results may be in data['results'] or data list
        results = data.get('results', data) if isinstance(data, dict) else data
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['to_location'], "DXB")

    def test_list_ticket_requests_admin_sees_all(self):
        """Test admin sees all customer ticket requests."""
        TicketRequest.objects.create(
            customer=self.customer1,
            trip_type=TripType.ONE_WAY,
            from_location="KTM",
            to_location="DXB",
            departure_date=self.dep_date
        )
        TicketRequest.objects.create(
            customer=self.customer2,
            trip_type=TripType.ONE_WAY,
            from_location="KTM",
            to_location="DOH",
            departure_date=self.dep_date
        )

        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()['data']
        results = data.get('results', data) if isinstance(data, dict) else data
        self.assertEqual(len(results), 2)

    def test_detail_ticket_request_owner_access(self):
        """Test customer can retrieve own ticket request detail."""
        ticket = TicketRequest.objects.create(
            customer=self.customer1,
            trip_type=TripType.ONE_WAY,
            from_location="KTM",
            to_location="DXB",
            departure_date=self.dep_date
        )

        self.client.force_authenticate(user=self.customer1)
        response = self.client.get(f'/api/v1/tickets/{ticket.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['data']['id'], ticket.id)

    def test_detail_ticket_request_unauthorized_customer_forbidden(self):
        """Test customer cannot view another customer's ticket request (403)."""
        ticket = TicketRequest.objects.create(
            customer=self.customer1,
            trip_type=TripType.ONE_WAY,
            from_location="KTM",
            to_location="DXB",
            departure_date=self.dep_date
        )

        # Customer 2 attempts to view Customer 1's ticket
        self.client.force_authenticate(user=self.customer2)
        response = self.client.get(f'/api/v1/tickets/{ticket.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_ticket_request_by_customer(self):
        """Test customer can update own pending ticket request details."""
        ticket = TicketRequest.objects.create(
            customer=self.customer1,
            trip_type=TripType.ONE_WAY,
            from_location="KTM",
            to_location="DXB",
            departure_date=self.dep_date,
            adults=1
        )

        self.client.force_authenticate(user=self.customer1)
        response = self.client.patch(
            f'/api/v1/tickets/{ticket.id}/',
            data={"adults": 3, "special_request": "Wheelchair assistance"},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ticket.refresh_from_db()
        self.assertEqual(ticket.adults, 3)
        self.assertEqual(ticket.special_request, "Wheelchair assistance")

    def test_update_ticket_request_by_admin(self):
        """Test admin can update status and quotation amount."""
        ticket = TicketRequest.objects.create(
            customer=self.customer1,
            trip_type=TripType.ONE_WAY,
            from_location="KTM",
            to_location="DXB",
            departure_date=self.dep_date,
            status=TicketStatus.PENDING
        )

        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(
            f'/api/v1/tickets/{ticket.id}/',
            data={
                "status": "CONFIRMED",
                "admin_notes": "Issued via FlyDubai FZ-576",
                "quotation_amount_npr": "38500.00"
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ticket.refresh_from_db()
        self.assertEqual(ticket.status, TicketStatus.CONFIRMED)
        self.assertEqual(ticket.admin_notes, "Issued via FlyDubai FZ-576")
        self.assertEqual(float(ticket.quotation_amount_npr), 38500.00)

    def test_unauthorized_update_forbidden(self):
        """Test customer cannot modify another customer's ticket request."""
        ticket = TicketRequest.objects.create(
            customer=self.customer1,
            trip_type=TripType.ONE_WAY,
            from_location="KTM",
            to_location="DXB",
            departure_date=self.dep_date
        )

        self.client.force_authenticate(user=self.customer2)
        response = self.client.patch(
            f'/api/v1/tickets/{ticket.id}/',
            data={"adults": 5},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_ticket_request(self):
        """Test customer deleting own ticket request."""
        ticket = TicketRequest.objects.create(
            customer=self.customer1,
            trip_type=TripType.ONE_WAY,
            from_location="KTM",
            to_location="DXB",
            departure_date=self.dep_date
        )

        self.client.force_authenticate(user=self.customer1)
        response = self.client.delete(f'/api/v1/tickets/{ticket.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(TicketRequest.objects.filter(id=ticket.id).exists())

    def test_validation_departure_date_in_past(self):
        """Test validation rejects past departure date."""
        self.client.force_authenticate(user=self.customer1)
        past_date = self.today - timedelta(days=2)
        payload = {
            "trip_type": "ONE_WAY",
            "from_location": "KTM",
            "to_location": "DXB",
            "departure_date": str(past_date),
            "adults": 1
        }
        response = self.client.post(self.list_create_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("departure_date", str(response.json()))

    def test_validation_round_trip_missing_return_date(self):
        """Test validation rejects round-trip request missing return date."""
        self.client.force_authenticate(user=self.customer1)
        payload = {
            "trip_type": "ROUND_TRIP",
            "from_location": "KTM",
            "to_location": "DXB",
            "departure_date": str(self.dep_date),
            "adults": 1
        }
        response = self.client.post(self.list_create_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("return_date", str(response.json()))

    def test_validation_return_date_before_departure(self):
        """Test validation rejects return date before departure date."""
        self.client.force_authenticate(user=self.customer1)
        payload = {
            "trip_type": "ROUND_TRIP",
            "from_location": "KTM",
            "to_location": "DXB",
            "departure_date": str(self.dep_date),
            "return_date": str(self.dep_date - timedelta(days=2)),
            "adults": 1
        }
        response = self.client.post(self.list_create_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("return_date", str(response.json()))

    def test_validation_invalid_adults_count(self):
        """Test validation rejects adults count < 1."""
        self.client.force_authenticate(user=self.customer1)
        payload = {
            "trip_type": "ONE_WAY",
            "from_location": "KTM",
            "to_location": "DXB",
            "departure_date": str(self.dep_date),
            "adults": 0
        }
        response = self.client.post(self.list_create_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthenticated_request_blocked(self):
        """Test unauthenticated user cannot access ticket endpoints."""
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class TravelportAirPriceTests(TestCase):
    """
    STEP 25: Automated Tests for Travelport AirPrice Re-pricing Endpoint (/api/v1/flights/price/)
    """

    def setUp(self):
        self.client = APIClient()
        self.price_url = '/api/v1/flights/price/'

    def test_valid_offer_confirmed(self):
        """Test pricing a valid flight offer returns CONFIRMED status with authoritative breakdown."""
        payload = {
            "offer_id": "OFFER-RA-7K9A",
            "displayed_price": 36866,
            "adults": 1,
            "children": 0,
            "cabin": "ECONOMY",
        }
        response = self.client.post(self.price_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json().get('data', {})
        self.assertEqual(data.get('price_status'), 'CONFIRMED')
        self.assertIn('total', data)
        self.assertIn('base_fare', data)
        self.assertIn('taxes', data)
        self.assertEqual(data.get('currency'), 'NPR')
        self.assertGreater(len(data.get('flight_segments', [])), 0)

    def test_expired_offer_unavailable(self):
        """Test pricing an expired flight offer returns UNAVAILABLE (HTTP 410)."""
        payload = {
            "offer_id": "OFFER-RA-EXPIRED-999",
            "displayed_price": 35000,
        }
        response = self.client.post(self.price_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_410_GONE)
        data = response.json().get('data', {})
        self.assertEqual(data.get('price_status'), 'UNAVAILABLE')

    def test_changed_price_detection(self):
        """Test price change detection when airline GDS updates seat fares."""
        payload = {
            "offer_id": "OFFER-RA-CHANGED-123",
            "displayed_price": 30000,  # lower than current authoritative price
        }
        response = self.client.post(self.price_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json().get('data', {})
        self.assertEqual(data.get('price_status'), 'PRICE_CHANGED')
        self.assertIsNotNone(data.get('old_price'))
        self.assertIn('total', data)

    def test_unavailable_offer_sold_out(self):
        """Test pricing a sold out / unavailable offer returns UNAVAILABLE."""
        payload = {
            "offer_id": "OFFER-EK-SOLDOUT-001",
        }
        response = self.client.post(self.price_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_410_GONE)
        data = response.json().get('data', {})
        self.assertEqual(data.get('price_status'), 'UNAVAILABLE')

    def test_invalid_offer_payload(self):
        """Test validation fails when offer_id is missing or malformed."""
        payload = {
            "offer_id": "",
        }
        response = self.client.post(self.price_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class FlightEndToEndBookingTests(TestCase):
    """
    STEPS 26-31: End-to-End Flight Reservation, Passenger Validation, Ticketing, PNR Lookup & Cancellation Tests
    """

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="flightcustomer@example.com",
            phone="9812193621",
            full_name="Flight Customer",
            role="CUSTOMER",
            password="StrongPassword123!"
        )
        self.validate_url = '/api/v1/flights/passengers/validate/'
        self.book_url = '/api/v1/flights/book/'
        self.ticket_url = '/api/v1/flights/ticket/'

    def test_passenger_validation_valid(self):
        """STEP 26: Test valid passenger details pass ICAO validation."""
        payload = {
            "passengers": [
                {
                    "passenger_type": "ADULT",
                    "title": "MR",
                    "first_name": "RAM",
                    "last_name": "SHRESTHA",
                    "gender": "MALE",
                    "date_of_birth": "1990-05-15",
                    "nationality": "Nepal",
                    "document_type": "PASSPORT",
                    "passport_number": "N1849204",
                    "document_expiry_date": "2030-10-15",
                    "meal_preference": "STANDARD",
                    "special_assistance": "NONE"
                }
            ],
            "contact_info": {
                "contact_name": "Ram Shrestha",
                "contact_email": "ram@example.com",
                "contact_phone": "+977 9812193621"
            }
        }
        response = self.client.post(self.validate_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_passenger_validation_invalid_dob(self):
        """STEP 26: Test adult passenger with child age triggers validation error."""
        payload = {
            "passengers": [
                {
                    "passenger_type": "ADULT",
                    "title": "MR",
                    "first_name": "CHILD",
                    "last_name": "USER",
                    "gender": "MALE",
                    "date_of_birth": "2020-05-15",  # 6 years old, not adult
                    "nationality": "Nepal",
                    "document_type": "PASSPORT",
                    "passport_number": "N1849204",
                }
            ]
        }
        response = self.client.post(self.validate_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_flight_booking_and_pnr_creation(self):
        """STEP 27: Test booking creation creates PNR and persistent database record."""
        self.client.force_authenticate(user=self.user)
        dep_date = timezone.now().date() + timedelta(days=14)
        payload = {
            "offer_id": "OFFER-RA-7K9A",
            "trip_type": "ONE_WAY",
            "from_location": "Kathmandu (KTM)",
            "to_location": "Dubai (DXB)",
            "departure_date": str(dep_date),
            "travel_class": "ECONOMY",
            "total_amount": "37500.00",
            "special_request": "Selected flight: Nepal Airlines (RA-204)",
            "passengers": [
                {
                    "passenger_type": "ADULT",
                    "title": "MR",
                    "first_name": "RAM",
                    "last_name": "SHRESTHA",
                    "gender": "MALE",
                    "date_of_birth": "1990-05-15",
                    "nationality": "Nepal",
                    "document_type": "PASSPORT",
                    "passport_number": "N1849204",
                }
            ],
            "payment_method": "ESEWA",
            "payment_reference": "ESEWA-918231"
        }
        response = self.client.post(self.book_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.json().get('data', {})
        self.assertIn('pnr', data)
        self.assertTrue(data['pnr'].startswith('DW-'))
        self.assertIn('ticket_id', data)

        # Verify STEP 30: PNR Retrieval
        pnr = data['pnr']
        pnr_resp = self.client.get(f'/api/v1/flights/pnr/{pnr}/')
        self.assertEqual(pnr_resp.status_code, status.HTTP_200_OK)

        # Verify STEP 31: Cancellation
        ticket_id = data['ticket_id']
        cancel_resp = self.client.post(f'/api/v1/flights/bookings/{ticket_id}/cancel/')
        self.assertEqual(cancel_resp.status_code, status.HTTP_200_OK)

    def test_e_ticket_issuance(self):
        """STEP 29: Test e-ticket issuance generates 13-digit ticket numbers."""
        self.client.force_authenticate(user=self.user)
        payload = {
            "booking_reference": "DW-RA789K",
            "payment_details": {"method": "ESEWA", "status": "PAID"}
        }
        response = self.client.post(self.ticket_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json().get('data', {})
        self.assertEqual(data.get('ticket_status'), 'ISSUED')
        self.assertIn('e_ticket_number', data)

