"""
Views for Customer profile endpoints.
"""

from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema
from common.responses import success_response, error_response
from common.permissions import IsAdminOrReadOnly
from .serializers import CustomerSerializer
from .services import CustomerService


class CustomerListView(APIView):
    """
    GET /api/v1/customers/ - List customers (View only for users)
    POST /api/v1/customers/ - Register a new customer (Admin only)
    """
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    serializer_class = CustomerSerializer

    @extend_schema(responses={200: CustomerSerializer(many=True)})
    def get(self, request):
        query = request.query_params.get('search', None)
        customers = CustomerService.get_all_customers(query)
        return success_response(data=customers, message="Customers list retrieved.")

    @extend_schema(request=CustomerSerializer, responses={201: CustomerSerializer})
    def post(self, request):
        serializer = CustomerSerializer(data=request.data)
        if serializer.is_valid():
            created = CustomerService.create_customer(serializer.validated_data)
            return success_response(
                data=created,
                message="Customer profile created successfully.",
                status_code=status.HTTP_201_CREATED
            )
        return error_response(errors=serializer.errors, message="Validation error.")


class CustomerDetailView(APIView):
    """
    GET /api/v1/customers/<int:pk>/ - Retrieve specific customer profile
    """
    serializer_class = CustomerSerializer

    @extend_schema(responses={200: CustomerSerializer})
    def get(self, request, pk):
        customer = CustomerService.get_customer_by_id(pk)
        return success_response(data=customer, message="Customer profile retrieved.")
