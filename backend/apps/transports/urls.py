"""
URL patterns for Nepal Roadway Transportation endpoints.
"""

from django.urls import path
from .views import (
    TransportTypesView,
    TransportRoutesListView,
    TransportScheduleSearchView,
    TransportScheduleDetailView,
    TransportBookingListCreateView,
    TransportBookingDetailView,
    SeedNepalTransportsView,
)

urlpatterns = [
    path('types/', TransportTypesView.as_view(), name='transport-types'),
    path('routes/', TransportRoutesListView.as_view(), name='transport-routes'),
    path('search/', TransportScheduleSearchView.as_view(), name='transport-search'),
    path('schedules/<int:pk>/', TransportScheduleDetailView.as_view(), name='transport-schedule-detail'),
    path('bookings/', TransportBookingListCreateView.as_view(), name='transport-bookings-list-create'),
    path('bookings/<str:identifier>/', TransportBookingDetailView.as_view(), name='transport-booking-detail'),
    path('seed/', SeedNepalTransportsView.as_view(), name='transport-seed'),
]

