"""
Serializers for Payment processing service.
"""

from rest_framework import serializers


class PaymentInitiateSerializer(serializers.Serializer):
    invoiceId = serializers.CharField(max_length=100, required=True)
    amountNpr = serializers.IntegerField(min_value=10, required=True)
    paymentMethod = serializers.ChoiceField(
        choices=['online_wallet', 'card', 'bank_transfer', 'cash_counter'],
        required=True
    )
    provider = serializers.CharField(max_length=50, required=False, allow_blank=True) # esewa, khalti, fonepay


class PaymentVerifySerializer(serializers.Serializer):
    transactionId = serializers.CharField(max_length=100, required=True)
    invoiceId = serializers.CharField(max_length=100, required=True)
    amountNpr = serializers.IntegerField(required=True)
    token = serializers.CharField(max_length=255, required=False, allow_blank=True)
