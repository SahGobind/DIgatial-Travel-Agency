"""
URL configuration for direct /api/v1/hotel-bookings/ routing.
"""

from django.urls import path
from .views import HotelBookingListCreateView, HotelBookingDetailView

urlpatterns = [
    path('', HotelBookingListCreateView.as_view(), name='hotel-booking-root-list-create'),
    path('<int:pk>/', HotelBookingDetailView.as_view(), name='hotel-booking-root-detail'),
]
