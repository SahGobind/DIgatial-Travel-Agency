"""
Serializers for Notifications service.
"""

from rest_framework import serializers


class NotificationSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    recipient = serializers.CharField(max_length=255)
    title = serializers.CharField(max_length=255)
    message = serializers.CharField(max_length=1000)
    type = serializers.ChoiceField(choices=['info', 'success', 'warning', 'reminder'], default='info')
    channel = serializers.ChoiceField(choices=['in_app', 'sms', 'email'], default='in_app')
    isRead = serializers.BooleanField(default=False)
    createdAt = serializers.DateTimeField(read_only=True)
