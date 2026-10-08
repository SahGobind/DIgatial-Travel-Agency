"""
Views for Notification endpoints.
"""

from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema
from common.responses import success_response
from .serializers import NotificationSerializer
from .services import NotificationService


class NotificationListView(APIView):
    """
    GET /api/v1/notifications/ - List user notifications
    """
    serializer_class = NotificationSerializer

    @extend_schema(responses={200: NotificationSerializer(many=True)})
    def get(self, request):
        notifications = NotificationService.get_user_notifications()
        return success_response(data=notifications, message="Notifications retrieved.")


class NotificationMarkReadView(APIView):
    """
    POST /api/v1/notifications/<int:pk>/read/ - Mark a notification as read
    """
    serializer_class = NotificationSerializer

    @extend_schema(request=None, responses={200: NotificationSerializer})
    def post(self, request, pk):
        updated = NotificationService.mark_as_read(pk)
        return success_response(data=updated, message="Notification marked as read.")
