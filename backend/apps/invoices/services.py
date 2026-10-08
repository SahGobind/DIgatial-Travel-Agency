"""
Service layer for Invoice & Billing business logic.
"""


class InvoiceService:
    @staticmethod
    def get_all_invoices(status=None):
        invoices = [
            {
                "id": "DW-2026-00124",
                "invoiceNumber": "DW-2026-00124",
                "date": "2026-09-18",
                "dueDate": "2026-09-25",
                "customerName": "Sonu Kumar Sah",
                "customerEmail": "sonu.sah@gmail.com",
                "customerPhone": "+977 9812193621",
                "service": "Dubai Express Tourist Visa & Flight",
                "status": "Paid",
                "subtotalNpr": 62000,
                "discountNpr": 2000,
                "taxNpr": 7800,
                "totalNpr": 67800,
                "paidNpr": 67800,
                "balanceNpr": 0,
                "paymentMethod": "Online Payment (eSewa)"
            },
            {
                "id": "DW-2026-00125",
                "invoiceNumber": "DW-2026-00125",
                "date": "2026-09-19",
                "dueDate": "2026-09-26",
                "customerName": "Pooja Jha",
                "customerEmail": "pooja.jha@outlook.com",
                "customerPhone": "+977 9801234567",
                "service": "Qatar Business Visa Processing",
                "status": "Unpaid",
                "subtotalNpr": 25000,
                "discountNpr": 0,
                "taxNpr": 3250,
                "totalNpr": 28250,
                "paidNpr": 0,
                "balanceNpr": 28250,
                "paymentMethod": None
            }
        ]
        if status and status != 'All':
            return [i for i in invoices if i['status'].lower() == status.lower()]
        return invoices

    @staticmethod
    def get_invoice_by_id(invoice_id):
        invoices = InvoiceService.get_all_invoices()
        for inv in invoices:
            if inv['id'] == invoice_id or inv['invoiceNumber'] == invoice_id:
                return inv
        return invoices[0]
