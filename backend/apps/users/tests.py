"""
Comprehensive tests for User Authentication, JWT Tokens, and Role-Based Permissions.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from common.permissions import IsCustomer, IsAdmin, IsStaffUser, IsAdminOrStaff

User = get_user_model()


class UserAuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/v1/auth/register/'
        self.login_url = '/api/v1/auth/login/'
        self.refresh_url = '/api/v1/auth/token/refresh/'
        self.me_url = '/api/v1/auth/me/'
        self.logout_url = '/api/v1/auth/logout/'

        self.valid_user_payload = {
            "full_name": "Roshan Kumar Sah",
            "email": "roshan@example.com",
            "phone": "+977 9812193621",
            "password": "SecurePassword123!",
            "confirm_password": "SecurePassword123!"
        }

    def test_user_registration_success(self):
        """Test registering a new customer account returns 201 and JWT tokens."""
        response = self.client.post(self.register_url, data=self.valid_user_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        data = response.json()
        self.assertTrue(data['success'])
        self.assertIn('tokens', data['data'])
        self.assertIn('access', data['data']['tokens'])
        self.assertIn('refresh', data['data']['tokens'])
        self.assertEqual(data['data']['user']['email'], "roshan@example.com")
        self.assertEqual(data['data']['user']['role'], "CUSTOMER")

        # Verify password is not saved in plaintext
        user = User.objects.get(email="roshan@example.com")
        self.assertNotEqual(user.password, "SecurePassword123!")
        self.assertTrue(user.check_password("SecurePassword123!"))

    def test_duplicate_email_registration_fails(self):
        """Test registration fails with 400 when email is already registered."""
        # Create initial user
        self.client.post(self.register_url, data=self.valid_user_payload, format='json')

        # Try to register duplicate email (case-insensitive)
        duplicate_payload = self.valid_user_payload.copy()
        duplicate_payload["email"] = "ROSHAN@example.com"
        response = self.client.post(self.register_url, data=duplicate_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        data = response.json()
        self.assertFalse(data['success'])

    def test_password_mismatch_registration_fails(self):
        """Test registration fails when password and confirm_password differ."""
        mismatch_payload = self.valid_user_payload.copy()
        mismatch_payload["confirm_password"] = "DifferentPassword123!"
        response = self.client.post(self.register_url, data=mismatch_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_short_password_registration_fails(self):
        """Test registration fails when password is less than 8 characters."""
        short_payload = self.valid_user_payload.copy()
        short_payload["password"] = "short"
        short_payload["confirm_password"] = "short"
        response = self.client.post(self.register_url, data=short_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login_success(self):
        """Test login with valid email and password returns JWT tokens."""
        User.objects.create_user(
            email="loginuser@example.com",
            full_name="Login Test User",
            phone="+977 9800000000",
            password="CorrectPassword123!"
        )

        login_payload = {
            "email": "loginuser@example.com",
            "password": "CorrectPassword123!"
        }
        response = self.client.post(self.login_url, data=login_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        self.assertTrue(data['success'])
        self.assertIn('access', data['data']['tokens'])
        self.assertIn('refresh', data['data']['tokens'])
        self.assertEqual(data['data']['user']['email'], "loginuser@example.com")
        self.assertNotIn('password', data['data']['user'])

    def test_invalid_password_login_fails(self):
        """Test login fails with invalid password."""
        User.objects.create_user(
            email="user2@example.com",
            full_name="User Two",
            password="CorrectPassword123!"
        )

        response = self.client.post(
            self.login_url,
            data={"email": "user2@example.com", "password": "WrongPassword!"},
            format='json'
        )
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_400_BAD_REQUEST, status.HTTP_403_FORBIDDEN])

    def test_nonexistent_user_login_fails(self):
        """Test login fails for unregistered email."""
        response = self.client.post(
            self.login_url,
            data={"email": "nonexistent@example.com", "password": "Password123!"},
            format='json'
        )
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_400_BAD_REQUEST, status.HTTP_403_FORBIDDEN])

    def test_jwt_token_refresh(self):
        """Test refreshing JWT access token with a valid refresh token."""
        reg_response = self.client.post(self.register_url, data=self.valid_user_payload, format='json')
        refresh_token = reg_response.json()['data']['tokens']['refresh']

        refresh_response = self.client.post(self.refresh_url, data={"refresh": refresh_token}, format='json')
        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        
        data = refresh_response.json()
        self.assertTrue(data['success'])
        self.assertIn('access', data['data'])

    def test_authenticated_me_endpoint(self):
        """Test GET /api/v1/auth/me/ returns user profile when valid Bearer token is provided."""
        reg_response = self.client.post(self.register_url, data=self.valid_user_payload, format='json')
        access_token = reg_response.json()['data']['tokens']['access']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['email'], "roshan@example.com")
        self.assertEqual(data['data']['full_name'], "Roshan Kumar Sah")
        self.assertEqual(data['data']['role'], "CUSTOMER")
        self.assertNotIn('password', data['data'])

    def test_unauthenticated_me_endpoint_fails(self):
        """Test GET /api/v1/auth/me/ fails with 401 when no token is provided."""
        self.client.credentials() # Clear credentials
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_endpoint(self):
        """Test POST /api/v1/auth/logout/ returns 200 OK."""
        response = self.client.post(self.logout_url, data={"refresh": "dummy-token"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.json()['success'])


class PermissionClassesTests(TestCase):
    def setUp(self):
        self.customer = User.objects.create_user(
            email="cust@example.com",
            full_name="Customer User",
            role="CUSTOMER",
            password="Password123!"
        )
        self.admin = User.objects.create_user(
            email="admin@example.com",
            full_name="Admin User",
            role="ADMIN",
            is_staff=True,
            password="Password123!"
        )
        self.staff = User.objects.create_user(
            email="staff@example.com",
            full_name="Staff User",
            role="STAFF",
            is_staff=True,
            password="Password123!"
        )

    def test_role_permissions(self):
        class MockRequest:
            def __init__(self, user):
                self.user = user

        cust_req = MockRequest(self.customer)
        admin_req = MockRequest(self.admin)
        staff_req = MockRequest(self.staff)

        # IsCustomer
        is_cust = IsCustomer()
        self.assertTrue(is_cust.has_permission(cust_req, None))
        self.assertFalse(is_cust.has_permission(admin_req, None))
        self.assertFalse(is_cust.has_permission(staff_req, None))

        # IsAdmin
        is_adm = IsAdmin()
        self.assertFalse(is_adm.has_permission(cust_req, None))
        self.assertTrue(is_adm.has_permission(admin_req, None))
        self.assertFalse(is_adm.has_permission(staff_req, None))

        # IsStaffUser
        is_stf = IsStaffUser()
        self.assertFalse(is_stf.has_permission(cust_req, None))
        self.assertTrue(is_stf.has_permission(admin_req, None))
        self.assertTrue(is_stf.has_permission(staff_req, None))

        # IsAdminOrStaff
        is_adm_stf = IsAdminOrStaff()
        self.assertFalse(is_adm_stf.has_permission(cust_req, None))
        self.assertTrue(is_adm_stf.has_permission(admin_req, None))
        self.assertTrue(is_adm_stf.has_permission(staff_req, None))


class SeedDataCommandTests(TestCase):
    def test_seed_data_command_execution(self):
        """Test python manage.py seed_data executes idempotently without errors."""
        from django.core.management import call_command
        from io import StringIO
        from apps.hotels.models import Hotel

        out = StringIO()
        call_command('seed_data', stdout=out)
        output = out.getvalue()
        self.assertIn("Database seeding completed successfully", output)
        self.assertTrue(User.objects.filter(email="admin@digitalworld.com").exists())
        self.assertTrue(Hotel.objects.filter(country="UAE").exists())

        # Second run with --clean to test idempotency and cleaning
        out_clean = StringIO()
        call_command('seed_data', '--clean', stdout=out_clean)
        self.assertIn("Database seeding completed successfully", out_clean.getvalue())

