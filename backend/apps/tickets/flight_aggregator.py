import os
import re
import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class FlightAggregator:
    """
    Flight Aggregator service connecting to Duffel API.
    Handles offer requests, multi-passenger flights, and cabin class queries.
    """

    def __init__(self, token=None):
        self.base_url = getattr(settings, "DUFFEL_API_BASE_URL", "https://api.duffel.com").rstrip("/")
        self.token = token or os.getenv("DUFFEL_ACCESS_TOKEN") or getattr(settings, "DUFFEL_ACCESS_TOKEN", None) or getattr(settings, "DUFFEL_API_TOKEN", None)

        if not self.token:
            logger.warning("DUFFEL_ACCESS_TOKEN is not configured in environment variables or settings.")

        self.headers = {
            "Authorization": f"Bearer {self.token}" if self.token else "",
            "Duffel-Version": "v2",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    @staticmethod
    def extract_iata_code(location_str):
        """
        Extract 3-letter IATA code from airport/city strings like 'Kathmandu (KTM)' -> 'KTM'.
        """
        if not location_str:
            return "KTM"
        match = re.search(r'\(([A-Za-z]{3})\)', location_str)
        if match:
            return match.group(1).upper()
        clean = re.sub(r'[^A-Za-z]', '', location_str)
        if len(clean) >= 3:
            return clean[:3].upper()
        return location_str.strip().upper()

    @staticmethod
    def map_cabin_class(cabin_class):
        """
        Map incoming cabin class to Duffel accepted values:
        'economy', 'premium_economy', 'business', 'first'
        """
        c = str(cabin_class).strip().lower().replace('-', '_').replace(' ', '_')
        if c in ['economy', 'premium_economy', 'business', 'first']:
            return c
        if 'prem' in c:
            return 'premium_economy'
        if 'bus' in c:
            return 'business'
        if 'first' in c:
            return 'first'
        return 'economy'

    def search(
        self,
        origin,
        destination,
        departure_date,
        passengers=1,
        cabin_class="economy",
        return_date=None,
    ):
        if not self.token:
            raise RuntimeError("DUFFEL_ACCESS_TOKEN is not configured")

        origin_code = self.extract_iata_code(origin)
        dest_code = self.extract_iata_code(destination)
        formatted_cabin = self.map_cabin_class(cabin_class)

        slices = [
            {
                "origin": origin_code,
                "destination": dest_code,
                "departure_date": str(departure_date),
            }
        ]

        if return_date:
            slices.append({
                "origin": dest_code,
                "destination": origin_code,
                "departure_date": str(return_date),
            })

        passenger_count = max(1, int(passengers))
        payload = {
            "data": {
                "slices": slices,
                "passengers": [
                    {"type": "adult"}
                    for _ in range(passenger_count)
                ],
                "cabin_class": formatted_cabin,
            }
        }

        response = requests.post(
            f"{self.base_url}/air/offer_requests",
            headers=self.headers,
            json=payload,
            timeout=30,
        )

        response.raise_for_status()
        return response.json()
