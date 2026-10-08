"""
Views for Invoice & Billing endpoints.
"""

from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema
from common.responses import success_response
from .serializers import InvoiceSerializer
from .services import InvoiceService


class InvoiceListView(APIView):
    """
    GET /api/v1/invoices/ - List invoices with optional status filter
    """
    serializer_class = InvoiceSerializer

    @extend_schema(responses={200: InvoiceSerializer(many=True)})
    def get(self, request):
        status = request.query_params.get('status', None)
        invoices = InvoiceService.get_all_invoices(status)
        return success_response(data=invoices, message="Invoices retrieved.")


class InvoiceDetailView(APIView):
    """
    GET /api/v1/invoices/<str:invoice_id>/ - Retrieve invoice details
    """
    serializer_class = InvoiceSerializer

    @extend_schema(responses={200: InvoiceSerializer})
    def get(self, request, invoice_id):
        invoice = InvoiceService.get_invoice_by_id(invoice_id)
        return success_response(data=invoice, message="Invoice details retrieved.")
