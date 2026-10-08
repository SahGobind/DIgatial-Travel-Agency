"""
Management command to seed development and demo data for Digital World Tour & Travels.
Includes: Admin, Staff, Customer accounts, Destinations (Dubai, Qatar, Saudi Arabia, Malaysia),
Hotels, Overseas Job Vacancies, and Sample Customer Activity.
"""

import os
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.hotels.models import Hotel, HotelBooking, HotelBookingStatus
from apps.tickets.models import TicketRequest, TripType, TravelClass, TicketStatus
from apps.visas.models import VisaApplication, VisaType, VisaStatus

User = get_user_model()


class Command(BaseCommand):
    help = "Seed database with safe development and demo data for Digital World Tour & Travels"

    def add_arguments(self, parser):
        parser.add_argument(
            '--clean',
            action='store_true',
            help='Clean existing demo records before seeding',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("=== Starting Database Seeding for Digital World Tour & Travels ==="))

        if options.get('clean'):
            self.stdout.write("Cleaning existing demo hotels and requests...")
            HotelBooking.objects.all().delete()
            TicketRequest.objects.all().delete()
            VisaApplication.objects.all().delete()
            Hotel.objects.all().delete()
            self.stdout.write(self.style.SUCCESS("Existing records cleaned."))

        # 1. Seed Users (Admin, Staff, Customer)
        admin_user = self.seed_admin_user()
        staff_user = self.seed_staff_user()
        customer_user = self.seed_customer_user()

        # 2. Seed Hotels across Destinations (Dubai, Qatar, Saudi Arabia, Malaysia, Nepal)
        hotels = self.seed_hotels()

        # 3. Seed Sample Customer Activity (Ticket Request, Visa Application, Hotel Booking)
        self.seed_sample_activity(customer_user, hotels)

        self.stdout.write(self.style.SUCCESS("\n[OK] Database seeding completed successfully!"))
        self.stdout.write(self.style.NOTICE(f"  Admin User: {admin_user.email}"))
        self.stdout.write(self.style.NOTICE(f"  Staff User: {staff_user.email}"))
        self.stdout.write(self.style.NOTICE(f"  Customer User: {customer_user.email}"))
        self.stdout.write(self.style.NOTICE(f"  Hotels Seeded: {len(hotels)}"))

    def seed_admin_user(self):
        admin_email = os.getenv('DEV_ADMIN_EMAIL', 'admin@digitalworld.com').lower().strip()
        admin_pass = os.getenv('DEV_ADMIN_PASSWORD', 'AdminPass2026!')
        admin_name = os.getenv('DEV_ADMIN_NAME', 'Digital World Administrator')
        admin_phone = os.getenv('DEV_ADMIN_PHONE', '+977 9812193621')

        user, created = User.objects.get_or_create(
            email=admin_email,
            defaults={
                'full_name': admin_name,
                'phone': admin_phone,
                'role': 'ADMIN',
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
            }
        )
        user.set_password(admin_pass)
        user.role = 'ADMIN'
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.save()

        action = "Created" if created else "Updated"
        self.stdout.write(self.style.SUCCESS(f"  [{action}] Superuser Admin: {admin_email}"))
        return user

    def seed_staff_user(self):
        staff_email = os.getenv('DEV_STAFF_EMAIL', 'staff@digitalworld.com').lower().strip()
        staff_pass = os.getenv('DEV_STAFF_PASSWORD', 'StaffPass2026!')

        user, created = User.objects.get_or_create(
            email=staff_email,
            defaults={
                'full_name': 'Janakpur Branch Officer',
                'phone': '+977 9812193622',
                'role': 'STAFF',
                'is_staff': True,
                'is_active': True,
            }
        )
        user.set_password(staff_pass)
        user.role = 'STAFF'
        user.is_staff = True
        user.is_active = True
        user.save()

        action = "Created" if created else "Updated"
        self.stdout.write(self.style.SUCCESS(f"  [{action}] Staff Member: {staff_email}"))
        return user

    def seed_customer_user(self):
        customer_email = os.getenv('DEV_CUSTOMER_EMAIL', 'customer@digitalworld.com').lower().strip()
        customer_pass = os.getenv('DEV_CUSTOMER_PASSWORD', 'CustomerPass2026!')

        user, created = User.objects.get_or_create(
            email=customer_email,
            defaults={
                'full_name': 'Roshan Kumar Sah',
                'phone': '+977 9812193621',
                'role': 'CUSTOMER',
                'is_active': True,
            }
        )
        user.set_password(customer_pass)
        user.role = 'CUSTOMER'
        user.is_active = True
        user.save()

        action = "Created" if created else "Updated"
        self.stdout.write(self.style.SUCCESS(f"  [{action}] Demo Customer: {customer_email}"))
        return user

    def seed_hotels(self):
        hotels_data = [
            # Dubai, UAE
            {
                "name": "Grand Millennium Hotel Business Bay",
                "location": "Business Bay, Downtown Dubai",
                "country": "UAE",
                "description": "5-star luxury hotel overlooking the Dubai Water Canal, minutes from Burj Khalifa and Dubai Mall.",
                "rating": 4.8,
                "price_per_night": 16500.00,
                "amenities": ["Free High-Speed WiFi", "Infinity Swimming Pool", "Spa & Wellness Center", "Fine Dining", "Airport Shuttle", "Fitness Center"],
                "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
                "is_active": True,
            },
            {
                "name": "Citymax Hotel Bur Dubai",
                "location": "Kuwait Street, Bur Dubai",
                "country": "UAE",
                "description": "Contemporary, affordable comfort close to Dubai World Trade Centre, shopping souks, and Metro stations.",
                "rating": 4.2,
                "price_per_night": 7200.00,
                "amenities": ["Free WiFi", "Rooftop Swimming Pool", "24/7 Coffee Shop", "Gym", "Business Center"],
                "image": "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80",
                "is_active": True,
            },
            # Qatar
            {
                "name": "Ezdan Palace Hotel Doha",
                "location": "Al Shamal Road, Doha",
                "country": "Qatar",
                "description": "Opulent Andalusian architectural luxury in Doha offering lavish suites, royal spa, and grand ballrooms.",
                "rating": 4.7,
                "price_per_night": 14000.00,
                "amenities": ["Olympic Swimming Pool", "Luxury Spa", "Gourmet Restaurants", "Free WiFi", "Valet Parking", "Concierge"],
                "image": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
                "is_active": True,
            },
            {
                "name": "Premier Inn Doha Airport",
                "location": "Saeed Bin Al Aas St, Old Airport, Doha",
                "country": "Qatar",
                "description": "Convenient, quiet comfort with complimentary airport transfers, ideal for business and transit travelers.",
                "rating": 4.3,
                "price_per_night": 6800.00,
                "amenities": ["Free Airport Shuttle", "Free WiFi", "On-site Restaurant", "Fitness Room", "Family Rooms"],
                "image": "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
                "is_active": True,
            },
            # Saudi Arabia
            {
                "name": "Crowne Plaza Riyadh Palace",
                "location": "Prince Fahd Bin Faisal St, Al Murabba, Riyadh",
                "country": "Saudi Arabia",
                "description": "Premium 4-star hotel in central Riyadh close to government ministries, business hubs, and historical landmarks.",
                "rating": 4.6,
                "price_per_night": 15500.00,
                "amenities": ["Outdoor Pool", "Executive Lounge", "Steam & Sauna", "Free High-Speed WiFi", "Conference Halls"],
                "image": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
                "is_active": True,
            },
            {
                "name": "Al Hamra Hotel Jeddah",
                "location": "Palestine Street, Al Hamra, Jeddah",
                "country": "Saudi Arabia",
                "description": "Strategic hotel near Jeddah Corniche and King Fahd Fountain, offering warm hospitality and modern amenities.",
                "rating": 4.3,
                "price_per_night": 11200.00,
                "amenities": ["Swimming Pool", "Gymnasium", "Free WiFi", "International Buffet", "Airport Transfer"],
                "image": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
                "is_active": True,
            },
            # Malaysia
            {
                "name": "Berjaya Times Square Hotel Kuala Lumpur",
                "location": "1 Jalan Imbi, Bukit Bintang, Kuala Lumpur",
                "country": "Malaysia",
                "description": "Iconic city hotel directly integrated with Berjaya Times Square shopping mall and monorail transit.",
                "rating": 4.7,
                "price_per_night": 9800.00,
                "amenities": ["Rooftop Pool", "Direct Monorail Access", "Fitness Center", "Sauna", "Multi-Cuisine Restaurants", "Free WiFi"],
                "image": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80",
                "is_active": True,
            },
            {
                "name": "Furama Bukit Bintang",
                "location": "136 Jalan Changkat Thambi Dollah, Kuala Lumpur",
                "country": "Malaysia",
                "description": "Modern high-rise hotel offering spectacular Kuala Lumpur skyline views, stylish comfort, and rooftop pool.",
                "rating": 4.4,
                "price_per_night": 6200.00,
                "amenities": ["Skyline Outdoor Pool", "Free WiFi", "Executive Lounge", "Gym", "Meeting Rooms"],
                "image": "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
                "is_active": True,
            },
            # Nepal (Janakpur Dham)
            {
                "name": "Hotel Janakpur Palace",
                "location": "Station Road, Janakpur Dham",
                "country": "Nepal",
                "description": "Premier hospitality landmark near Janaki Mandir, offering traditional Mithila hospitality and modern executive comfort.",
                "rating": 4.8,
                "price_per_night": 4500.00,
                "amenities": ["Free High-Speed WiFi", "Air Conditioning", "Mithila Specialty Restaurant", "Banquet Hall", "24/7 Power Backup"],
                "image": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
                "is_active": True,
            },
        ]

        created_hotels = []
        for h_data in hotels_data:
            hotel, created = Hotel.objects.update_or_create(
                name=h_data["name"],
                location=h_data["location"],
                defaults=h_data
            )
            created_hotels.append(hotel)

        self.stdout.write(self.style.SUCCESS(f"  [OK] Seeded {len(created_hotels)} Demo Hotels"))
        return created_hotels


    def seed_sample_activity(self, customer, hotels):
        today = timezone.now().date()

        # 1. Sample Flight Ticket Request
        ticket, _ = TicketRequest.objects.get_or_create(
            customer=customer,
            from_location="Kathmandu (KTM)",
            to_location="Dubai (DXB)",
            defaults={
                "trip_type": TripType.ROUND_TRIP,
                "departure_date": today + timedelta(days=14),
                "return_date": today + timedelta(days=28),
                "adults": 1,
                "children": 0,
                "travel_class": TravelClass.ECONOMY,
                "special_request": "Window seat preferred. Vegetarian meal.",
                "status": TicketStatus.QUOTATION_SENT,
                "admin_notes": "Quotation prepared via FlyDubai direct flight FZ-576.",
                "quotation_amount_npr": 38500.00
            }
        )

        # 2. Sample Visa Application
        visa, _ = VisaApplication.objects.get_or_create(
            customer=customer,
            country="UAE",
            passport_number="N18294720",
            defaults={
                "visa_type": VisaType.TOURIST,
                "full_name": customer.full_name,
                "phone": customer.phone,
                "email": customer.email,
                "travel_date": today + timedelta(days=14),
                "nationality": "Nepalese",
                "status": VisaStatus.UNDER_REVIEW,
                "admin_notes": "Passport copy and photo verified. Awaiting embassy clearance.",
                "government_fee_npr": 16500.00
            }
        )

        # 3. Sample Hotel Booking
        if hotels:
            dubai_hotel = next((h for h in hotels if "Dubai" in h.location), hotels[0])
            booking, _ = HotelBooking.objects.get_or_create(
                customer=customer,
                hotel=dubai_hotel,
                check_in=today + timedelta(days=14),
                defaults={
                    "check_out": today + timedelta(days=19),
                    "guests": 1,
                    "rooms": 1,
                    "status": HotelBookingStatus.CONFIRMED,
                    "total_amount": dubai_hotel.price_per_night * 5,
                    "special_requests": "High floor non-smoking room."
                }
            )

        self.stdout.write(self.style.SUCCESS("  [OK] Seeded Sample Customer Activity (Tickets, Visas, Hotels)"))

