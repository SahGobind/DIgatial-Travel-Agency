"""
Service layer for Payment transactions business logic.
"""

import random
from datetime import datetime


class PaymentService:
    @staticmethod
    def initiate_payment(data):
        tx_id = f"TXN-DW-{random.randint(10000000, 99999999)}"
        return {
            "transactionId": tx_id,
            "invoiceId": data.get("invoiceId"),
            "amountNpr": data.get("amountNpr"),
            "paymentMethod": data.get("paymentMethod"),
            "provider": data.get("provider", "eSewa"),
            "status": "Initiated",
            "initiatedAt": datetime.now().isoformat()
        }

    @staticmethod
    def verify_payment(data):
        return {
            "transactionId": data.get("transactionId"),
            "invoiceId": data.get("invoiceId"),
            "amountPaidNpr": data.get("amountNpr"),
            "status": "Completed",
            "receiptNumber": f"RCPT-{random.randint(10000, 99999)}",
            "verifiedAt": datetime.now().isoformat()
        }

    @staticmethod
    def list_transactions():
        return [
            {
                "transactionId": "TXN-DW-99218204",
                "invoiceId": "DW-2026-00124",
                "customerName": "Sonu Kumar Sah",
                "amountNpr": 67800,
                "paymentMethod": "Online Wallet (eSewa)",
                "status": "Completed",
                "paidAt": "2026-09-18 14:32"
            }
        ]
