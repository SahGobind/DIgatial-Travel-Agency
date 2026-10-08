"""
Standardized API response helpers for Digital World Tour & Travels backend.
"""

from rest_framework.response import Response
from rest_framework import status


def success_response(data=None, message="Success", status_code=status.HTTP_200_OK):
    """
    Standard format for successful API responses:
    {
        "success": true,
        "message": "...",
        "data": { ... }
    }
    """
    return Response(
        {
            "success": True,
            "message": message,
            "data": data if data is not None else {},
        },
        status=status_code,
    )


def error_response(errors=None, message="An error occurred", status_code=status.HTTP_400_BAD_REQUEST):
    """
    Standard format for error API responses:
    {
        "success": false,
        "message": "...",
        "errors": { ... }
    }
    """
    return Response(
        {
            "success": False,
            "message": message,
            "errors": errors if errors is not None else {},
        },
        status=status_code,
    )
