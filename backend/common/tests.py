"""
Automated tests for Digital World Tour & Travels REST API Architecture.
"""

from django.test import TestCase, Client
from rest_framework import status


class ApiArchitectureTests(TestCase):
    def setUp(self):
        self.client = Client()
        from django.contrib.auth import get_user_model
        User = get_user_model()
        self.user = User.objects.create_user(
            email="testuser@example.com",
            full_name="Test User",
            password="Password123!"
        )
        from rest_framework_simplejwt.tokens import RefreshToken
        token = str(RefreshToken.for_user(self.user).access_token)
        self.auth_headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}

    def test_health_check_endpoint(self):
        """Verify GET /api/v1/health/ returns 200 and standard response."""
        response = self.client.get('/api/v1/health/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(data.get('success'))
        self.assertEqual(data.get('message'), "Digital World Tour & Travels API is running")

    def test_invalid_endpoint_returns_404(self):
        """Verify requesting a non-existent endpoint returns 404."""
        response = self.client.get('/api/v1/non-existent-route-xyz/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_api_v1_endpoints_response_structure(self):
        """Verify core API v1 endpoints return standard response envelope {success, message, data}."""
        endpoints = [
            '/api/v1/auth/',
            '/api/v1/customers/',
            '/api/v1/tickets/',
            '/api/v1/visas/',
            '/api/v1/hotels/',
            '/api/v1/payments/',
            '/api/v1/invoices/',
            '/api/v1/notifications/',
        ]
        for endpoint in endpoints:
            with self.subTest(endpoint=endpoint):
                response = self.client.get(endpoint, **self.auth_headers)
                self.assertEqual(response.status_code, status.HTTP_200_OK)
                json_data = response.json()
                self.assertIn('success', json_data)
                self.assertIn('message', json_data)
                self.assertIn('data', json_data)
                self.assertTrue(json_data['success'])


    def test_ticket_fare_estimation(self):
        """Verify ticket fare estimation endpoint returns calculated estimate."""
        payload = {
            "fromCity": "Kathmandu (KTM)",
            "toCity": "Dubai (DXB)",
            "flightType": "international",
            "cabinClass": "economy"
        }
        response = self.client.post('/api/v1/tickets/estimate/', data=payload, content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertIn('estimatedFareNpr', data['data'])

    def test_visa_requirements_endpoint(self):
        """Verify visa requirements endpoint returns checklist and government fees in NPR."""
        response = self.client.get('/api/v1/visas/requirements/?country=UAE&category=tourist')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['country'], 'UAE')
        self.assertIn('requiredDocuments', data['data'])
        self.assertIn('governmentFeeNpr', data['data'])

    def test_openapi_schema_endpoint(self):
        """Verify OpenAPI schema is generated successfully."""
        response = self.client.get('/api/schema/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_swagger_ui_endpoint(self):
        """Verify Swagger UI docs endpoint is reachable."""
        response = self.client.get('/api/docs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
