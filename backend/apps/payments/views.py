"""
Views for Payment processing endpoints.
"""

from rest_framework.views import APIView
from rest_framework import status
from drf_spectacular.utils import extend_schema
from common.responses import success_response, error_response
from .serializers import PaymentInitiateSerializer, PaymentVerifySerializer
from .services import PaymentService


class PaymentListView(APIView):
    """
    GET /api/v1/payments/ - List payment transactions audit
    """
    @extend_schema(responses={200: dict})
    def get(self, request):
        txns = PaymentService.list_transactions()
        return success_response(data=txns, message="Payment transactions list retrieved.")


class PaymentInitiateView(APIView):
    """
    POST /api/v1/payments/initiate/ - Start payment checkout
    """
    serializer_class = PaymentInitiateSerializer

    @extend_schema(request=PaymentInitiateSerializer, responses={201: PaymentInitiateSerializer})
    def post(self, request):
        serializer = PaymentInitiateSerializer(data=request.data)
        if serializer.is_valid():
            initiated = PaymentService.initiate_payment(serializer.validated_data)
            return success_response(
                data=initiated,
                message="Payment session initialized.",
                status_code=status.HTTP_201_CREATED
            )
        return error_response(errors=serializer.errors, message="Payment initiation error.")


class PaymentVerifyView(APIView):
    """
    POST /api/v1/payments/verify/ - Verify payment gateway callback
    """
    serializer_class = PaymentVerifySerializer

    @extend_schema(request=PaymentVerifySerializer)
    def post(self, request):
        serializer = PaymentVerifySerializer(data=request.data)
        if serializer.is_valid():
            verified = PaymentService.verify_payment(serializer.validated_data)
            return success_response(data=verified, message="Payment verified and cleared.")
        return error_response(errors=serializer.errors, message="Payment verification failed.")
