"""
Views for Visa Application Management, Secure Document Uploads, and Requirements.
"""

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.exceptions import PermissionDenied, NotFound
from rest_framework import status
from drf_spectacular.utils import extend_schema
from common.responses import success_response, error_response
from common.pagination import StandardResultsSetPagination
from .models import VisaApplication
from .serializers import (
    VisaApplicationSerializer,
    VisaApplicationAdminUpdateSerializer,
    VisaApplicationCustomerUpdateSerializer,
    VisaDocumentSerializer,
    VisaDocumentUploadSerializer,
)
from .services import VisaService


class VisaApplicationListCreateView(APIView):
    """
    GET /api/v1/visas/ - List visa applications (Customer sees own, Admin/Staff sees all)
    POST /api/v1/visas/ - Submit a new visa application
    """
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    @extend_schema(responses={200: VisaApplicationSerializer(many=True)})
    def get(self, request):
        queryset = VisaService.get_user_queryset(request.user)

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        if page is not None:
            serializer = VisaApplicationSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = VisaApplicationSerializer(queryset, many=True)
        return success_response(
            data=serializer.data,
            message="Visa applications retrieved successfully."
        )

    @extend_schema(request=VisaApplicationSerializer, responses={201: VisaApplicationSerializer})
    def post(self, request):
        serializer = VisaApplicationSerializer(data=request.data)
        if serializer.is_valid():
            application = VisaService.create_visa_application(
                user=request.user,
                validated_data=serializer.validated_data
            )
            response_serializer = VisaApplicationSerializer(application)
            return success_response(
                data=response_serializer.data,
                message="Visa application submitted successfully.",
                status_code=status.HTTP_201_CREATED
            )
        return error_response(
            errors=serializer.errors,
            message="Validation error in visa application.",
            status_code=status.HTTP_400_BAD_REQUEST
        )


class VisaApplicationDetailView(APIView):
    """
    GET /api/v1/visas/{id}/ - Retrieve visa application details and documents
    PATCH /api/v1/visas/{id}/ - Update application (Admin: status/notes/fee, Customer: details)
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        try:
            application = VisaApplication.objects.select_related('customer').prefetch_related('documents').get(pk=pk)
        except VisaApplication.DoesNotExist:
            raise NotFound(detail="Visa application not found.")

        is_admin_or_staff = (
            getattr(user, 'role', None) in ['ADMIN', 'STAFF'] or
            user.is_staff or
            user.is_superuser
        )

        if not is_admin_or_staff and application.customer != user:
            raise PermissionDenied("You do not have permission to access this visa application.")

        return application

    @extend_schema(responses={200: VisaApplicationSerializer})
    def get(self, request, pk):
        application = self.get_object(pk, request.user)
        serializer = VisaApplicationSerializer(application)
        return success_response(
            data=serializer.data,
            message="Visa application retrieved successfully."
        )

    @extend_schema(request=VisaApplicationAdminUpdateSerializer, responses={200: VisaApplicationSerializer})
    def patch(self, request, pk):
        application = self.get_object(pk, request.user)
        is_admin_or_staff = (
            getattr(request.user, 'role', None) in ['ADMIN', 'STAFF'] or
            request.user.is_staff or
            request.user.is_superuser
        )

        if is_admin_or_staff:
            serializer = VisaApplicationAdminUpdateSerializer(application, data=request.data, partial=True)
        else:
            serializer = VisaApplicationCustomerUpdateSerializer(application, data=request.data, partial=True)

        if serializer.is_valid():
            updated_application = serializer.save()
            response_serializer = VisaApplicationSerializer(updated_application)
            return success_response(
                data=response_serializer.data,
                message="Visa application updated successfully."
            )
        return error_response(
            errors=serializer.errors,
            message="Failed to update visa application.",
            status_code=status.HTTP_400_BAD_REQUEST
        )


class VisaDocumentUploadView(APIView):
    """
    POST /api/v1/visas/{id}/documents/ - Securely upload document to visa application
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self, pk, user):
        try:
            application = VisaApplication.objects.select_related('customer').get(pk=pk)
        except VisaApplication.DoesNotExist:
            raise NotFound(detail="Visa application not found.")

        is_admin_or_staff = (
            getattr(user, 'role', None) in ['ADMIN', 'STAFF'] or
            user.is_staff or
            user.is_superuser
        )

        if not is_admin_or_staff and application.customer != user:
            raise PermissionDenied("You do not have permission to upload documents to this application.")

        return application

    @extend_schema(request=VisaDocumentUploadSerializer, responses={201: VisaDocumentSerializer})
    def post(self, request, pk):
        application = self.get_object(pk, request.user)
        serializer = VisaDocumentUploadSerializer(data=request.data)
        if serializer.is_valid():
            document = VisaService.attach_document(
                application=application,
                file_obj=serializer.validated_data['file'],
                document_type=serializer.validated_data.get('document_type', 'PASSPORT')
            )
            doc_serializer = VisaDocumentSerializer(document)
            return success_response(
                data=doc_serializer.data,
                message="Document uploaded and verified successfully.",
                status_code=status.HTTP_201_CREATED
            )
        return error_response(
            errors=serializer.errors,
            message="Document validation failed.",
            status_code=status.HTTP_400_BAD_REQUEST
        )


class VisaRequirementsView(APIView):
    """
    GET /api/v1/visas/requirements/?country=UAE&category=tourist
    """
    permission_classes = [AllowAny]

    @extend_schema(responses={200: dict})
    def get(self, request):
        country = request.query_params.get('country', 'UAE')
        category = request.query_params.get('category', 'tourist')
        info = VisaService.get_visa_requirements(country, category)
        return success_response(
            data=info,
            message=f"Visa requirements for {country} retrieved successfully."
        )
