"""
Service layer for Notifications dispatch & retrieval.
"""

from datetime import datetime


class NotificationService:
    @staticmethod
    def get_user_notifications(user_id=None):
        return [
            {
                "id": 1,
                "title": "Visa Application Approved",
                "message": "Your UAE Tourist Visa application (Ref: DW-VSA-2026-9102) has been approved by immigration.",
                "type": "success",
                "channel": "in_app",
                "isRead": False,
                "createdAt": datetime.now().isoformat()
            },
            {
                "id": 2,
                "title": "Flight Ticket Confirmed",
                "message": "Your flight ticket KTM -> DXB on FlyDubai has been issued. Check invoice DW-2026-00124.",
                "type": "info",
                "channel": "in_app",
                "isRead": True,
                "createdAt": datetime.now().isoformat()
            }
        ]

    @staticmethod
    def mark_as_read(notification_id):
        return {
            "id": notification_id,
            "isRead": True,
            "updatedAt": datetime.now().isoformat()
        }
