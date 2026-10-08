"""
Comprehensive tests for Visa Application API: CRUD, Scoping, Document Uploads, File Validation, Permissions.
"""

from datetime import timedelta
from django.test import TestCase
from django.utils import timezone
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import VisaApplication, VisaDocument, VisaType, VisaStatus

User = get_user_model()


class VisaApplicationApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.today = timezone.now().date()
        self.travel_date = self.today + timedelta(days=30)

        # Create Customer 1
        self.customer1 = User.objects.create_user(
            email="visacust1@example.com",
            full_name="Sonu Kumar Sah",
            role="CUSTOMER",
            phone="+977 9812193621",
            password="Password123!"
        )

        # Create Customer 2
        self.customer2 = User.objects.create_user(
            email="visacust2@example.com",
            full_name="Other Applicant",
            role="CUSTOMER",
            phone="+977 9822222222",
            password="Password123!"
        )

        # Create Admin
        self.admin = User.objects.create_user(
            email="visaadmin@example.com",
            full_name="Visa Officer Admin",
            role="ADMIN",
            is_staff=True,
            password="Password123!"
        )

        self.list_create_url = '/api/v1/visas/'

    def test_create_visa_application_success(self):
        """Test customer submitting a valid visa application."""
        self.client.force_authenticate(user=self.customer1)
        payload = {
            "country": "UAE",
            "visa_type": "TOURIST",
            "full_name": "Sonu Kumar Sah",
            "phone": "+977 9812193621",
            "email": "sonu@example.com",
            "passport_number": "N12345678",
            "travel_date": str(self.travel_date),
            "nationality": "Nepalese"
        }
        response = self.client.post(self.list_create_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['country'], "UAE")
        self.assertEqual(data['data']['visa_type'], "TOURIST")
        self.assertEqual(data['data']['status'], "SUBMITTED")
        self.assertEqual(data['data']['customer_details']['email'], "visacust1@example.com")
        self.assertIsNotNone(data['data']['government_fee_npr'])

    def test_list_visa_applications_customer_isolation(self):
        """Test customer only sees their own applications."""
        VisaApplication.objects.create(
            customer=self.customer1,
            country="UAE",
            visa_type=VisaType.TOURIST,
            full_name="Sonu Sah",
            phone="+977 9812193621",
            email="sonu@example.com",
            passport_number="N1111111",
            travel_date=self.travel_date
        )
        VisaApplication.objects.create(
            customer=self.customer2,
            country="Qatar",
            visa_type=VisaType.WORK,
            full_name="Other",
            phone="+977 9822222222",
            email="other@example.com",
            passport_number="N2222222",
            travel_date=self.travel_date
        )

        self.client.force_authenticate(user=self.customer1)
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()['data']
        results = data.get('results', data) if isinstance(data, dict) else data
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['country'], "UAE")

    def test_list_visa_applications_admin_sees_all(self):
        """Test admin sees all submitted applications."""
        VisaApplication.objects.create(
            customer=self.customer1,
            country="UAE",
            visa_type=VisaType.TOURIST,
            full_name="Sonu Sah",
            phone="+977 9812193621",
            email="sonu@example.com",
            passport_number="N1111111",
            travel_date=self.travel_date
        )
        VisaApplication.objects.create(
            customer=self.customer2,
            country="Qatar",
            visa_type=VisaType.WORK,
            full_name="Other",
            phone="+977 9822222222",
            email="other@example.com",
            passport_number="N2222222",
            travel_date=self.travel_date
        )

        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()['data']
        results = data.get('results', data) if isinstance(data, dict) else data
        self.assertEqual(len(results), 2)

    def test_retrieve_visa_application_detail(self):
        """Test customer retrieving their own application detail."""
        app = VisaApplication.objects.create(
            customer=self.customer1,
            country="UAE",
            visa_type=VisaType.TOURIST,
            full_name="Sonu Sah",
            phone="+977 9812193621",
            email="sonu@example.com",
            passport_number="N1111111",
            travel_date=self.travel_date
        )

        self.client.force_authenticate(user=self.customer1)
        response = self.client.get(f'/api/v1/visas/{app.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['data']['id'], app.id)

    def test_retrieve_unauthorized_application_forbidden(self):
        """Test customer attempting to view another customer's application returns 403."""
        app = VisaApplication.objects.create(
            customer=self.customer1,
            country="UAE",
            visa_type=VisaType.TOURIST,
            full_name="Sonu Sah",
            phone="+977 9812193621",
            email="sonu@example.com",
            passport_number="N1111111",
            travel_date=self.travel_date
        )

        self.client.force_authenticate(user=self.customer2)
        response = self.client.get(f'/api/v1/visas/{app.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_update_status_and_notes(self):
        """Test admin updating application status to APPROVED with notes and government fee."""
        app = VisaApplication.objects.create(
            customer=self.customer1,
            country="UAE",
            visa_type=VisaType.TOURIST,
            full_name="Sonu Sah",
            phone="+977 9812193621",
            email="sonu@example.com",
            passport_number="N1111111",
            travel_date=self.travel_date,
            status=VisaStatus.SUBMITTED
        )

        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(
            f'/api/v1/visas/{app.id}/',
            data={
                "status": "APPROVED",
                "admin_notes": "Visa sticker printed and verified.",
                "government_fee_npr": "16500.00"
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        app.refresh_from_db()
        self.assertEqual(app.status, VisaStatus.APPROVED)
        self.assertEqual(app.admin_notes, "Visa sticker printed and verified.")
        self.assertEqual(float(app.government_fee_npr), 16500.00)

    def test_customer_update_application(self):
        """Test customer updating travel information on own application."""
        app = VisaApplication.objects.create(
            customer=self.customer1,
            country="UAE",
            visa_type=VisaType.TOURIST,
            full_name="Sonu Sah",
            phone="+977 9812193621",
            email="sonu@example.com",
            passport_number="N1111111",
            travel_date=self.travel_date
        )

        new_travel_date = self.travel_date + timedelta(days=15)
        self.client.force_authenticate(user=self.customer1)
        response = self.client.patch(
            f'/api/v1/visas/{app.id}/',
            data={"travel_date": str(new_travel_date)},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        app.refresh_from_db()
        self.assertEqual(str(app.travel_date), str(new_travel_date))

    def test_validation_past_travel_date_fails(self):
        """Test application with past travel date fails validation."""
        self.client.force_authenticate(user=self.customer1)
        payload = {
            "country": "UAE",
            "visa_type": "TOURIST",
            "full_name": "Sonu Kumar Sah",
            "phone": "+977 9812193621",
            "email": "sonu@example.com",
            "passport_number": "N12345678",
            "travel_date": str(self.today - timedelta(days=5)),
            "nationality": "Nepalese"
        }
        response = self.client.post(self.list_create_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("travel_date", str(response.json()))

    def test_validation_invalid_passport_number(self):
        """Test application with short/invalid passport number fails validation."""
        self.client.force_authenticate(user=self.customer1)
        payload = {
            "country": "UAE",
            "visa_type": "TOURIST",
            "full_name": "Sonu Kumar Sah",
            "phone": "+977 9812193621",
            "email": "sonu@example.com",
            "passport_number": "12",
            "travel_date": str(self.travel_date)
        }
        response = self.client.post(self.list_create_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("passport_number", str(response.json()))


class VisaDocumentUploadTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.today = timezone.now().date()
        self.travel_date = self.today + timedelta(days=25)

        self.customer = User.objects.create_user(
            email="docuser@example.com",
            full_name="Document Applicant",
            role="CUSTOMER",
            password="Password123!"
        )
        self.other_user = User.objects.create_user(
            email="otheruser@example.com",
            full_name="Other User",
            role="CUSTOMER",
            password="Password123!"
        )
        self.application = VisaApplication.objects.create(
            customer=self.customer,
            country="UAE",
            visa_type=VisaType.TOURIST,
            full_name="Document Applicant",
            phone="+977 9811111111",
            email="docuser@example.com",
            passport_number="N9876543",
            travel_date=self.travel_date
        )
        self.upload_url = f'/api/v1/visas/{self.application.id}/documents/'

    def test_upload_valid_pdf_document(self):
        """Test uploading a valid PDF document attachment."""
        self.client.force_authenticate(user=self.customer)
        pdf_content = b"%PDF-1.4 Mock PDF binary content"
        pdf_file = SimpleUploadedFile("passport.pdf", pdf_content, content_type="application/pdf")

        response = self.client.post(
            self.upload_url,
            data={"document_type": "PASSPORT_FRONT", "file": pdf_file},
            format='multipart'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['document_type'], "PASSPORT_FRONT")
        self.assertEqual(data['data']['file_name'], "passport.pdf")

    def test_upload_valid_jpg_image(self):
        """Test uploading a valid JPG image attachment."""
        self.client.force_authenticate(user=self.customer)
        jpg_content = b"\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01" + b"A" * 50
        jpg_file = SimpleUploadedFile("photo.jpg", jpg_content, content_type="image/jpeg")

        response = self.client.post(
            self.upload_url,
            data={"document_type": "PHOTO_PP", "file": jpg_file},
            format='multipart'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.json()['success'])

    def test_upload_invalid_file_extension_fails(self):
        """Test uploading an executable/text file fails validation (400)."""
        self.client.force_authenticate(user=self.customer)
        txt_file = SimpleUploadedFile("malicious.exe", b"malicious executable code", content_type="application/x-dosexec")

        response = self.client.post(
            self.upload_url,
            data={"document_type": "PASSPORT", "file": txt_file},
            format='multipart'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.json()['success'])

    def test_upload_oversized_file_fails(self):
        """Test uploading a file > 5MB fails validation (400)."""
        self.client.force_authenticate(user=self.customer)
        large_content = b"0" * (6 * 1024 * 1024)  # 6 MB
        large_file = SimpleUploadedFile("large.pdf", large_content, content_type="application/pdf")

        response = self.client.post(
            self.upload_url,
            data={"document_type": "BANK_STATEMENT", "file": large_file},
            format='multipart'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("exceeds maximum allowed limit", str(response.json()))

    def test_upload_to_unauthorized_application_forbidden(self):
        """Test user cannot upload documents to another customer's application (403)."""
        self.client.force_authenticate(user=self.other_user)
        pdf_file = SimpleUploadedFile("passport.pdf", b"%PDF-1.4 sample", content_type="application/pdf")

        response = self.client.post(
            self.upload_url,
            data={"document_type": "PASSPORT", "file": pdf_file},
            format='multipart'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
