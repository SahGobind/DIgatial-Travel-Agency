"""
URL configuration for Invoice endpoints.
"""

from django.urls import path
from .views import InvoiceListView, InvoiceDetailView

urlpatterns = [
    path('', InvoiceListView.as_view(), name='invoice-list'),
    path('<str:invoice_id>/', InvoiceDetailView.as_view(), name='invoice-detail'),
]
