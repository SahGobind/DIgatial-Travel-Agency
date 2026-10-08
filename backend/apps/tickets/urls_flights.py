"""
URL configuration for Flight API Endpoints (/api/v1/flights/).
"""

from django.urls import path
from .views_flights import (
    FlightSearchAPI,
    FlightPriceAPI,
    FlightPassengerValidateAPI,
    FlightOfferDetailAPI,
    FlightOfferPriceAPI,
    FlightBookAPI,
    FlightTicketAPI,
    FlightBookingListAPI,
    FlightBookingDetailAPI,
    FlightPNRDetailAPI,
    FlightBookingCancelAPI,
    FlightProviderStatusAPI,
)

urlpatterns = [
    # STEP 25: Travelport AirPrice re-pricing endpoint
    path('price/', FlightPriceAPI.as_view(), name='flight-api-price'),

    # STEP 26: Passenger validation endpoint
    path('passengers/validate/', FlightPassengerValidateAPI.as_view(), name='flight-api-passenger-validate'),

    # 0. Provider Authentication Status & Health
    path('provider-status/', FlightProviderStatusAPI.as_view(), name='flight-api-provider-status'),

    # 1. Search live flights
    path('search/', FlightSearchAPI.as_view(), name='flight-api-search'),

    # 2. Get latest offer details
    path('offers/<str:offer_id>/', FlightOfferDetailAPI.as_view(), name='flight-api-offer-detail'),
    
    # 3. Confirm / Lock current price
    path('offers/<str:offer_id>/price/', FlightOfferPriceAPI.as_view(), name='flight-api-offer-price'),
    
    # 4. Create reservation / booking
    path('book/', FlightBookAPI.as_view(), name='flight-api-book'),
    
    # 5. Issue ticket
    path('ticket/', FlightTicketAPI.as_view(), name='flight-api-ticket'),
    
    # 6. Get booking list & details by ID or PNR
    path('bookings/', FlightBookingListAPI.as_view(), name='flight-api-booking-list'),
    path('bookings/<int:pk>/', FlightBookingDetailAPI.as_view(), name='flight-api-booking-detail'),
    path('pnr/<str:pnr>/', FlightPNRDetailAPI.as_view(), name='flight-api-pnr-detail'),
    
    # 7. Cancel booking
    path('bookings/<int:pk>/cancel/', FlightBookingCancelAPI.as_view(), name='flight-api-booking-cancel'),
]

