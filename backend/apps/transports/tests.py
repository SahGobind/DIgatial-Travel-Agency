"""
Unit and integration tests for Nepal Roadway Transportation API.
"""

from decimal import Decimal
from datetime import date, timedelta
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model

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
from .services import TransportService

User = get_user_model()


class TransportAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='nepal.traveler@example.com',
            password='Password123!',
            full_name='Hari Bahadur'
        )

        # Create sample vehicle
        self.vehicle = TransportVehicle.objects.create(
            name='Jagadamba VIP 2x1 Sofa Tourist Bus',
            operator_name='Jagadamba Travels',
            vehicle_type=VehicleType.TOURIST_BUS,
            vehicle_number='BA 2 KHA 8844',
            total_seats=28,
            seat_layout='2x1_SOFA',
            rating=Decimal('4.9'),
            amenities=['Air Conditioned', 'VIP Sofa Seats', 'Free Wi-Fi']
        )

        # Create sample route
        self.route = TransportRoute.objects.create(
            route_name='Kathmandu -> Pokhara (Prithvi Highway)',
            from_city='Kathmandu',
            to_city='Pokhara',
            highway_name='Prithvi Highway',
            distance_km=204,
            estimated_duration='6 - 7 Hours',
            boarding_points=[
                {'stop': 'Kalanki Petrol Pump', 'time': '07:15 AM'},
                {'stop': 'Balaju Chowk', 'time': '06:45 AM'}
            ],
            dropping_points=[
                {'stop': 'Tourist Bus Park, Pokhara', 'time': '01:30 PM'}
            ]
        )

        # Create sample schedule
        self.schedule = TransportSchedule.objects.create(
            vehicle=self.vehicle,
            route=self.route,
            departure_time='07:00:00',
            arrival_time='13:30:00',
            shift=ShiftType.MORNING,
            pricing_type=PricingType.PER_SEAT,
            fare_npr=Decimal('1600.00'),
            is_active=True
        )

        self.tomorrow = (date.today() + timedelta(days=1)).isoformat()

    def test_get_transport_types(self):
        """Test retrieving vehicle categories"""
        response = self.client.get('/api/v1/transports/types/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.json()['success'])

    def test_get_transport_routes(self):
        """Test retrieving distinct origin/destination hubs"""
        response = self.client.get('/api/v1/transports/routes/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()['data']
        self.assertIn('from_cities', data)
        self.assertIn('Kathmandu', data['from_cities'])

    def test_search_transports(self):
        """Test searching schedules with filters"""
        response = self.client.get('/api/v1/transports/search/', {
            'from_city': 'Kathmandu',
            'to_city': 'Pokhara',
            'date': self.tomorrow
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.json().get('data', {}).get('results', response.json().get('data', []))
        self.assertTrue(len(results) >= 1)

    def test_create_booking_success(self):
        """Test creating a roadway transport booking and database persistence"""
        payload = {
            'schedule_id': self.schedule.id,
            'travel_date': self.tomorrow,
            'passenger_name': 'Ram Prasad',
            'passenger_phone': '9841001122',
            'passenger_email': 'ram@nepal.com',
            'selected_seats': ['A1', 'A2'],
            'seat_count': 2,
            'boarding_point': 'Kalanki Petrol Pump',
            'dropping_point': 'Tourist Bus Park, Pokhara',
            'payment_status': 'PAY_ON_BOARDING',
            'special_notes': 'Two travel bags'
        }
        response = self.client.post('/api/v1/transports/bookings/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        res_data = response.json()['data']
        self.assertTrue(res_data['booking_reference'].startswith('DW-ROAD-'))
        self.assertEqual(res_data['passenger_name'], 'Ram Prasad')
        self.assertEqual(float(res_data['total_amount_npr']), 3200.0)

        # Verify record exists in DB
        booking = TransportBooking.objects.get(booking_reference=res_data['booking_reference'])
        self.assertEqual(booking.passenger_phone, '9841001122')
        self.assertEqual(booking.selected_seats, ['A1', 'A2'])

    def test_seat_conflict_validation(self):
        """Test that booking the same seat twice on the same date fails with validation error"""
        TransportBooking.objects.create(
            schedule=self.schedule,
            travel_date=self.tomorrow,
            passenger_name='Existing Passenger',
            passenger_phone='9811112222',
            selected_seats=['B1'],
            seat_count=1,
            boarding_point='Kalanki',
            dropping_point='Pokhara',
            total_amount_npr=Decimal('1600.00'),
            status=BookingStatus.CONFIRMED
        )

        # Attempt to book B1 again
        payload = {
            'schedule_id': self.schedule.id,
            'travel_date': self.tomorrow,
            'passenger_name': 'Second Passenger',
            'passenger_phone': '9822223333',
            'selected_seats': ['B1'],
            'boarding_point': 'Kalanki',
            'dropping_point': 'Pokhara'
        }
        response = self.client.post('/api/v1/transports/bookings/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.json()['success'])
        self.assertIn('already booked', response.json()['errors']['selected_seats'][0])
