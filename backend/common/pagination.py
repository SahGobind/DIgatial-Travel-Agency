"""
Custom pagination classes for Digital World Tour & Travels API.
"""

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardResultsSetPagination(PageNumberPagination):
    """
    Standard pagination format returning structured envelope:
    {
        "success": true,
        "message": "Data retrieved successfully",
        "data": {
            "count": 100,
            "next": "...",
            "previous": "...",
            "page_size": 10,
            "results": [ ... ]
        }
    }
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'success': True,
            'message': 'Data retrieved successfully',
            'data': {
                'count': self.page.paginator.count,
                'next': self.get_next_link(),
                'previous': self.get_previous_link(),
                'page': self.page.number,
                'total_pages': self.page.paginator.num_pages,
                'results': data,
            }
        })
