"""
Service layer for Customer management business logic.
"""


class CustomerService:
    @staticmethod
    def get_all_customers(query=None):
        return [
            {
                "id": 1,
                "fullName": "Sonu Kumar Sah",
                "email": "sonu.sah@gmail.com",
                "phone": "+977 9812193621",
                "address": "Janakpur Dham - 4, Dhanusha, Nepal",
                "passportNumber": "NP-882109",
                "citizenshipNumber": "17-01-75-01928",
                "totalBookings": 3
            },
            {
                "id": 2,
                "fullName": "Pooja Jha",
                "email": "pooja.jha@outlook.com",
                "phone": "+977 9801234567",
                "address": "Ramanand Chowk, Janakpur Dham, Nepal",
                "passportNumber": "NP-771234",
                "citizenshipNumber": "17-01-76-08123",
                "totalBookings": 1
            }
        ]

    @staticmethod
    def get_customer_by_id(customer_id):
        return {
            "id": customer_id,
            "fullName": "Sonu Kumar Sah",
            "email": "sonu.sah@gmail.com",
            "phone": "+977 9812193621",
            "address": "Janakpur Dham - 4, Dhanusha, Nepal",
            "passportNumber": "NP-882109",
            "citizenshipNumber": "17-01-75-01928",
            "totalBookings": 3
        }

    @staticmethod
    def create_customer(data):
        return {
            "id": 3,
            **data,
            "totalBookings": 0
        }
