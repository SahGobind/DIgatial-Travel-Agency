"""
Custom DRF exception handler for standardized error responses.
"""

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Transforms any DRF exception into a standard JSON envelope:
    {
        "success": false,
        "message": "Error description",
        "errors": { ... }
    }
    """
    response = exception_handler(exc, context)

    if response is not None:
        custom_data = {
            "success": False,
            "message": "An error occurred while processing your request.",
            "errors": {}
        }

        if isinstance(response.data, dict):
            # Extract detailed error messages
            detail = response.data.get('detail', None)
            if detail:
                custom_data["message"] = str(detail)
                custom_data["errors"] = response.data
            else:
                custom_data["message"] = "Validation failed. Please check the input data."
                custom_data["errors"] = response.data
        elif isinstance(response.data, list):
            custom_data["message"] = "Validation errors occurred."
            custom_data["errors"] = {"non_field_errors": response.data}
        else:
            custom_data["message"] = str(response.data)
            custom_data["errors"] = {"detail": response.data}

        response.data = custom_data

    return response
