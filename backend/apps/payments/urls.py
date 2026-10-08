"""
URL configuration for Payment endpoints.
"""

from django.urls import path
from .views import PaymentListView, PaymentInitiateView, PaymentVerifyView

urlpatterns = [
    path('', PaymentListView.as_view(), name='payment-list'),
    path('initiate/', PaymentInitiateView.as_view(), name='payment-initiate'),
    path('verify/', PaymentVerifyView.as_view(), name='payment-verify'),
]
