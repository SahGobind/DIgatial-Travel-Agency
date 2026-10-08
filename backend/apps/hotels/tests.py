"""
Automated tests for Hotel Listings and Hotel Booking APIs.
"""

from datetime import timedelta
from django.test import TestCase
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Hotel, HotelBooking, HotelBookingStatus

User = get_user_model()


class HotelApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.today = timezone.now().date()
        self.check_in = self.today + timedelta(days=5)
        self.check_out = self.today + timedelta(days=9)

        self.customer1 = User.objects.create_user(
            email="hotelcust1@example.com",
            full_name="Hotel Guest",
            role="CUSTOMER",
            password="Password123!"
        )
        self.customer2 = User.objects.create_user(
            email="hotelcust2@example.com",
            full_name="Other Guest",
            role="CUSTOMER",
            password="Password123!"
        )
        self.admin = User.objects.create_user(
            email="hoteladmin@example.com",
            full_name="Hotel Manager",
            role="ADMIN",
            is_staff=True,
            password="Password123!"
        )

        self.hotel = Hotel.objects.create(
            name="Hotel Janakpur Palace",
            location="Station Road, Janakpur Dham",
            country="Nepal",
            price_per_night=4500.00,
            rating=4.8,
            amenities=["Free WiFi", "AC", "Breakfast", "Swimming Pool"]
        )

    def test_list_hotels_public(self):
        """Test public users can browse active hotel listings."""
        response = self.client.get('/api/v1/hotels/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()['data']
        results = data.get('results', data) if isinstance(data, dict) else data
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['name'], "Hotel Janakpur Palace")

    def test_retrieve_hotel_detail(self):
        """Test public users can retrieve individual hotel details."""
        response = self.client.get(f'/api/v1/hotels/{self.hotel.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['data']['name'], "Hotel Janakpur Palace")

    def test_create_hotel_booking_success(self):
        """Test authenticated customer creating a hotel reservation."""
        self.client.force_authenticate(user=self.customer1)
        payload = {
            "hotel_id": self.hotel.id,
            "check_in": str(self.check_in),
            "check_out": str(self.check_out),
            "guests": 2,
            "rooms": 1,
            "special_requests": "Upper floor room preferred"
        }
        response = self.client.post('/api/v1/hotel-bookings/', data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['status'], "PENDING")
        self.assertEqual(float(data['data']['total_amount']), 4500.00 * 4)  # 4 nights * 4500
        self.assertEqual(data['data']['customer_details']['email'], "hotelcust1@example.com")

    def test_list_hotel_bookings_customer_isolation(self):
        """Test customer only sees their own hotel bookings."""
        HotelBooking.objects.create(
            customer=self.customer1,
            hotel=self.hotel,
            check_in=self.check_in,
            check_out=self.check_out,
            total_amount=18000.00
        )
        HotelBooking.objects.create(
            customer=self.customer2,
            hotel=self.hotel,
            check_in=self.check_in,
            check_out=self.check_out,
            total_amount=18000.00
        )

        self.client.force_authenticate(user=self.customer1)
        response = self.client.get('/api/v1/hotel-bookings/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()['data']
        results = data.get('results', data) if isinstance(data, dict) else data
        self.assertEqual(len(results), 1)

    def test_list_hotel_bookings_admin_sees_all(self):
        """Test admin sees all hotel bookings."""
        HotelBooking.objects.create(
            customer=self.customer1,
            hotel=self.hotel,
            check_in=self.check_in,
            check_out=self.check_out,
            total_amount=18000.00
        )
        HotelBooking.objects.create(
            customer=self.customer2,
            hotel=self.hotel,
            check_in=self.check_in,
            check_out=self.check_out,
            total_amount=18000.00
        )

        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/v1/hotel-bookings/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()['data']
        results = data.get('results', data) if isinstance(data, dict) else data
        self.assertEqual(len(results), 2)

    def test_cross_customer_booking_access_forbidden(self):
        """Test accessing another customer's booking returns 403."""
        booking = HotelBooking.objects.create(
            customer=self.customer1,
            hotel=self.hotel,
            check_in=self.check_in,
            check_out=self.check_out,
            total_amount=18000.00
        )

        self.client.force_authenticate(user=self.customer2)
        response = self.client.get(f'/api/v1/hotel-bookings/{booking.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_validation_checkout_before_checkin_fails(self):
        """Test booking fails when check-out is before or equal to check-in."""
        self.client.force_authenticate(user=self.customer1)
        payload = {
            "hotel_id": self.hotel.id,
            "check_in": str(self.check_in),
            "check_out": str(self.check_in),
            "guests": 1,
            "rooms": 1
        }
        response = self.client.post('/api/v1/hotel-bookings/', data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
