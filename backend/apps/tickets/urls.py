"""
URL configuration for Ticket endpoints.
"""

from django.urls import path
from .views import (
    TicketRequestListCreateView,
    TicketRequestDetailView,
    TicketFareEstimateView,
    FlightSearchAPIView,
    FlightRepriceAPIView,
    FlightBookAPIView,
)

urlpatterns = [
    path('', TicketRequestListCreateView.as_view(), name='ticket-list-create'),
    path('<int:pk>/', TicketRequestDetailView.as_view(), name='ticket-detail'),
    path('estimate/', TicketFareEstimateView.as_view(), name='ticket-estimate'),
    path('search/', FlightSearchAPIView.as_view(), name='flight-search'),
    path('reprice/', FlightRepriceAPIView.as_view(), name='flight-reprice'),
    path('book/', FlightBookAPIView.as_view(), name='flight-book'),
]

