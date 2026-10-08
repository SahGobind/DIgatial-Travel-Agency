"""
URL configuration for Hotel and Hotel Booking endpoints.
"""

from django.urls import path
from .views import (
    HotelListCreateView,
    HotelDetailView,
    HotelBookingListCreateView,
    HotelBookingDetailView,
)

urlpatterns = [
    path('', HotelListCreateView.as_view(), name='hotel-list-create'),
    path('<int:pk>/', HotelDetailView.as_view(), name='hotel-detail'),
    path('bookings/', HotelBookingListCreateView.as_view(), name='hotel-booking-list-create'),
    path('bookings/<int:pk>/', HotelBookingDetailView.as_view(), name='hotel-booking-detail'),
]
