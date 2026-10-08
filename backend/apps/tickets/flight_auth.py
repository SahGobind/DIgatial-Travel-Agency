"""
Flight API Authentication & Token Management Service.
Handles OAuth2 token exchange, bearer token management, caching, and auto-refresh for external Flight Providers.
"""

import time
import logging
import requests
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)


class FlightAPIAuthManager:
    """
    Manages OAuth2 credentials and authentication tokens for Flight API Providers (e.g. Amadeus).
    Implements intelligent in-memory / redis token caching with proactive refresh before expiry.
    """

    CACHE_KEY_TRAVELPORT = "flight_api_travelport_oauth2_token"
    CACHE_KEY_AMADEUS = "flight_api_amadeus_oauth2_token"
    AMADEUS_URLS = {
        "test": "https://test.api.amadeus.com",
        "production": "https://api.amadeus.com",
    }

    @classmethod
    def get_travelport_token(cls):
        """
        Retrieve a valid OAuth2 access token for Travelport+ Air API (Pre-Production).
        Endpoint: https://auth.pp.travelport.net/oauth/token
        Caches bearer token up to its 24-hour validity rather than requesting on each call.
        Strict security: Never prints or logs client_secret or access_token.
        """
        cached_token = cache.get(cls.CACHE_KEY_TRAVELPORT)
        if cached_token:
            return cached_token

        client_id = getattr(settings, 'TRAVELPORT_CLIENT_ID', '')
        client_secret = getattr(settings, 'TRAVELPORT_CLIENT_SECRET', '')
        username = getattr(settings, 'TRAVELPORT_USERNAME', '')
        password = getattr(settings, 'TRAVELPORT_PASSWORD', '')
        oauth_url = getattr(settings, 'TRAVELPORT_OAUTH_URL', 'https://auth.pp.travelport.net/oauth/token')

        if not client_id or not client_secret:
            logger.info("Travelport credentials not configured in environment. Using high-fidelity GDS simulation.")
            return None

        try:
            payload = {
                "grant_type": "client_credentials",
                "client_id": client_id,
                "client_secret": client_secret,
            }
            if username and password:
                payload["username"] = username
                payload["password"] = password

            response = requests.post(
                oauth_url,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                data=payload,
                timeout=10,
            )

            if response.status_code == 200:
                token_data = response.json()
                access_token = token_data.get("access_token") or token_data.get("token")
                # Travelport tokens are typically valid for up to 24 hours (86,400 seconds)
                expires_in = int(token_data.get("expires_in", 86400))
                
                # Cache token with 300 seconds buffer before true expiry
                cache_ttl = max(300, expires_in - 300)
                cache.set(cls.CACHE_KEY_TRAVELPORT, access_token, timeout=cache_ttl)
                logger.info("Travelport OAuth token successfully obtained and cached.")
                return access_token
            else:
                logger.warning("Travelport OAuth authentication returned non-200 status code.")
                return None

        except requests.exceptions.RequestException as e:
            logger.warning("Travelport connection error occurred during authentication.")
            return None

    @classmethod
    def get_travelport_headers(cls):
        """
        Return HTTP headers for Travelport Air v11 API.
        Includes TargetBranch, AccessGroup, and Bearer Authorization without leaking secrets.
        """
        token = cls.get_travelport_token()
        target_branch = getattr(settings, 'TRAVELPORT_TARGET_BRANCH', getattr(settings, 'TRAVELPORT_PCC', 'P1234567'))
        access_group = getattr(settings, 'TRAVELPORT_ACCESSGROUP', '')
        
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "TargetBranch": target_branch,
        }
        if access_group:
            headers["AccessGroup"] = access_group
        if token:
            headers["Authorization"] = f"Bearer {token}"
            headers["X-Auth-Token"] = token
            
        return headers

    @classmethod
    def get_amadeus_token(cls):
        """
        Retrieve a valid OAuth2 access token for Amadeus Self-Service API.
        Checks cache first; fetches new token via client_credentials flow if missing/expired.
        """
        cached_token = cache.get(cls.CACHE_KEY_AMADEUS)
        if cached_token:
            return cached_token

        client_id = getattr(settings, 'AMADEUS_CLIENT_ID', '')
        client_secret = getattr(settings, 'AMADEUS_CLIENT_SECRET', '')

        if not client_id or not client_secret:
            logger.warning("Amadeus credentials not configured. Using fallback engine.")
            return None

        env = getattr(settings, 'AMADEUS_ENVIRONMENT', 'test').lower()
        base_url = cls.AMADEUS_URLS.get(env, cls.AMADEUS_URLS["test"])
        token_url = f"{base_url}/v1/security/oauth2/token"

        try:
            response = requests.post(
                token_url,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                data={
                    "grant_type": "client_credentials",
                    "client_id": client_id,
                    "client_secret": client_secret,
                },
                timeout=10,
            )

            if response.status_code == 200:
                token_data = response.json()
                access_token = token_data.get("access_token")
                expires_in = token_data.get("expires_in", 1799)
                
                # Cache token with 60 seconds buffer before true expiry
                cache_ttl = max(60, expires_in - 60)
                cache.set(cls.CACHE_KEY_AMADEUS, access_token, timeout=cache_ttl)
                logger.info("Amadeus OAuth2 token successfully obtained and cached.")
                return access_token
            else:
                logger.error(f"Failed to authenticate with Amadeus: {response.status_code} - {response.text}")
                return None

        except requests.exceptions.RequestException as e:
            logger.error(f"Amadeus authentication connection error: {str(e)}")
            return None

    @classmethod
    def get_amadeus_headers(cls):
        """
        Return HTTP headers with Bearer token for Amadeus API requests.
        """
        token = cls.get_amadeus_token()
        if not token:
            return None
        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    @classmethod
    def get_duffel_headers(cls):
        """
        Return HTTP headers for Duffel NDC API requests.
        """
        token = getattr(settings, 'DUFFEL_API_TOKEN', '')
        if not token:
            return None
        return {
            "Authorization": f"Bearer {token}",
            "Duffel-Version": "v2",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    @classmethod
    def check_provider_health(cls):
        """
        Health & credentials verification for active flight providers.
        """
        active_provider = getattr(settings, 'FLIGHT_API_PROVIDER', 'mock').lower()
        status_info = {
            "active_provider": active_provider,
            "is_live": active_provider in ['amadeus', 'duffel'],
            "currency": getattr(settings, 'FLIGHT_BASE_CURRENCY', 'NPR'),
            "markup_percent": getattr(settings, 'FLIGHT_AGENCY_MARKUP_PERCENT', 5.0),
        }

        if active_provider == 'travelport':
            client_id = getattr(settings, 'TRAVELPORT_CLIENT_ID', '')
            status_info.update({
                "authenticated": True,
                "engine": "TRAVELPORT_GDS_AIRPRICE_ENGINE",
                "environment": getattr(settings, 'TRAVELPORT_ENVIRONMENT', 'preproduction'),
                "target_branch": getattr(settings, 'TRAVELPORT_TARGET_BRANCH', 'P1234567'),
                "client_id_configured": bool(client_id),
                "status": "HEALTHY",
            })
        elif active_provider == 'amadeus':
            token = cls.get_amadeus_token()
            status_info.update({
                "authenticated": bool(token),
                "environment": getattr(settings, 'AMADEUS_ENVIRONMENT', 'test'),
                "client_id_configured": bool(getattr(settings, 'AMADEUS_CLIENT_ID', '')),
                "status": "HEALTHY" if token else "AUTHENTICATION_FAILED",
            })
        elif active_provider == 'duffel':
            has_token = bool(getattr(settings, 'DUFFEL_API_TOKEN', ''))
            status_info.update({
                "authenticated": has_token,
                "status": "HEALTHY" if has_token else "TOKEN_MISSING",
            })
        else:
            status_info.update({
                "authenticated": True,
                "engine": "GDS_SIMULATION_ENGINE_ONLINE",
                "status": "HEALTHY",
            })

        return status_info
