"""
Serializers for Invoices & Billing management.
"""

from rest_framework import serializers


class InvoiceItemSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    service = serializers.CharField(max_length=100)
    description = serializers.CharField(max_length=500)
    quantity = serializers.IntegerField(default=1)
    unitPriceNpr = serializers.IntegerField()
    totalNpr = serializers.IntegerField()


class InvoiceSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    invoiceNumber = serializers.CharField(read_only=True)
    date = serializers.DateField()
    dueDate = serializers.DateField()
    customerName = serializers.CharField(max_length=255)
    customerEmail = serializers.EmailField()
    customerPhone = serializers.CharField(max_length=20)
    service = serializers.CharField(max_length=255)
    status = serializers.ChoiceField(choices=['Paid', 'Unpaid', 'Pending', 'Overdue'])
    items = InvoiceItemSerializer(many=True, required=False)
    subtotalNpr = serializers.IntegerField()
    discountNpr = serializers.IntegerField(default=0)
    taxNpr = serializers.IntegerField(default=0)
    totalNpr = serializers.IntegerField()
    paidNpr = serializers.IntegerField(default=0)
    balanceNpr = serializers.IntegerField()
