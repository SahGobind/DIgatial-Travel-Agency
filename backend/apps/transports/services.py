"""
Business logic and service layer for Nepal Roadway Transportation.
"""

from decimal import Decimal
from django.db.models import Q
from .models import (
    TransportVehicle,
    TransportRoute,
    TransportSchedule,
    TransportBooking,
    VehicleType,
    ShiftType,
    PricingType,
    BookingStatus,
    PaymentStatus,
)


class TransportService:
    @staticmethod
    def search_schedules(from_city=None, to_city=None, vehicle_type=None, shift=None, travel_date=None):
        """
        Search available vehicle schedules based on origin, destination, vehicle category, and shift.
        """
        queryset = TransportSchedule.objects.filter(
            is_active=True,
            vehicle__is_active=True,
            route__is_active=True
        ).select_related('vehicle', 'route')

        if from_city and from_city.strip() and from_city.strip().lower() != 'all':
            queryset = queryset.filter(route__from_city__icontains=from_city.strip())

        if to_city and to_city.strip() and to_city.strip().lower() != 'all':
            queryset = queryset.filter(route__to_city__icontains=to_city.strip())

        if vehicle_type and vehicle_type.strip() and vehicle_type.strip().upper() != 'ALL':
            queryset = queryset.filter(vehicle__vehicle_type=vehicle_type.strip().upper())

        if shift and shift.strip() and shift.strip().upper() != 'ALL':
            queryset = queryset.filter(shift=shift.strip().upper())

        return queryset.order_by('departure_time', 'fare_npr')

    @staticmethod
    def create_booking(user, validated_data):
        """
        Create and persist a new road transport reservation.
        """
        booking = TransportBooking(
            schedule=validated_data['schedule'],
            travel_date=validated_data['travel_date'],
            passenger_name=validated_data['passenger_name'],
            passenger_phone=validated_data['passenger_phone'],
            passenger_email=validated_data.get('passenger_email', ''),
            selected_seats=validated_data['selected_seats'],
            seat_count=validated_data['seat_count'],
            boarding_point=validated_data['boarding_point'],
            dropping_point=validated_data['dropping_point'],
            total_amount_npr=validated_data['total_amount_npr'],
            payment_status=validated_data.get('payment_status', PaymentStatus.PAY_ON_BOARDING),
            status=BookingStatus.CONFIRMED,
            special_notes=validated_data.get('special_notes', '')
        )
        if user and user.is_authenticated:
            booking.customer = user

        booking.save()
        return booking

    @staticmethod
    def seed_initial_nepal_transport():
        """
        Pre-populates the database with real Nepal roadway vehicles, routes, and schedules.
        Covers Tourist Buses, HiAce Microbuses, 4x4 Mountain Jeeps, Intercity Cabs, and Night Coaches.
        """
        if TransportVehicle.objects.exists():
            return {
                "message": "Nepal transport vehicles already seeded.",
                "vehicles": TransportVehicle.objects.count(),
                "routes": TransportRoute.objects.count(),
                "schedules": TransportSchedule.objects.count()
            }

        # 1. VEHICLES
        vehicles_data = [
            {
                "name": "Jagadamba VIP 2x1 Sofa Tourist Bus",
                "operator_name": "Jagadamba Travels Nepal",
                "vehicle_type": VehicleType.TOURIST_BUS,
                "vehicle_number": "BA 2 KHA 8844",
                "total_seats": 28,
                "seat_layout": "2x1_SOFA",
                "rating": Decimal("4.9"),
                "description": "Ultra luxury 2x1 leather sofa seating, high air suspension, onboard mineral water, movie entertainment and USB fast charging.",
                "amenities": ["Air Conditioned", "2x1 VIP Sofa Seats", "Free Wi-Fi", "USB Fast Charging", "Air Suspension", "Bottled Water", "First Aid Kit"],
                "image_url": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80"
            },
            {
                "name": "Swift Holiday Deluxe Tourist Coach",
                "operator_name": "Swift Holidays Pokhara",
                "vehicle_type": VehicleType.TOURIST_BUS,
                "vehicle_number": "GA 1 KHA 7210",
                "total_seats": 32,
                "seat_layout": "2x2_DELUXE",
                "rating": Decimal("4.8"),
                "description": "Premium tourist bus connecting Kathmandu, Pokhara, and Chitwan. Pushback ergonomic seats, experienced tourist drivers.",
                "amenities": ["Air Conditioned", "Pushback Seats", "Bottled Water", "Scenic Highway Route", "Emergency Exit", "Reading Lights"],
                "image_url": "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80"
            },
            {
                "name": "Super BP HiAce Express (High Speed)",
                "operator_name": "Mithila-Kathmandu Express Fleet",
                "vehicle_type": VehicleType.MICRO_BUS,
                "vehicle_number": "NA 5 KHA 3312",
                "total_seats": 14,
                "seat_layout": "HIACE_14",
                "rating": Decimal("4.7"),
                "description": "Fast highway transit via the scenic BP Highway. Reaches Janakpur and Sindhuli in under 6 hours with comfort and great hills views.",
                "amenities": ["Air Conditioned", "Express Highway Speed", "Experienced Hill Driver", "Clean Cabin", "Music System", "Luggage Boot"],
                "image_url": "https://images.unsplash.com/photo-1559297434-fae8a1916a79?auto=format&fit=crop&w=800&q=80"
            },
            {
                "name": "Force Urbania Luxury Commuter",
                "operator_name": "Prithvi Commuter Lines",
                "vehicle_type": VehicleType.MICRO_BUS,
                "vehicle_number": "BA 3 KHA 9104",
                "total_seats": 17,
                "seat_layout": "URBANIA_17",
                "rating": Decimal("4.8"),
                "description": "Modern European styling, individual AC vents, reclining captain seats. The smoothest microbus ride in Nepal.",
                "amenities": ["Individual AC Vents", "Pushback Captain Chairs", "Spacious Headroom", "USB Ports", "Luggage Space"],
                "image_url": "https://images.unsplash.com/photo-1509749837427-ac94a2553d0e?auto=format&fit=crop&w=800&q=80"
            },
            {
                "name": "Himalayan 4WD Mahindra Scorpio / Sumo",
                "operator_name": "Himalayan Off-Road 4x4 Network",
                "vehicle_type": VehicleType.JEEP_4X4,
                "vehicle_number": "BA 1 JHA 4402",
                "total_seats": 7,
                "seat_layout": "JEEP_7",
                "rating": Decimal("4.9"),
                "description": "Heavy-duty 4x4 all-terrain vehicle specially equipped for rugged mountain roads (Muktinath, Manang, Salleri, Langtang).",
                "amenities": ["4WD Off-Road Capability", "High Ground Clearance", "Roof Luggage Carrier", "Heavy Hill Tires", "Trekker Friendly"],
                "image_url": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80"
            },
            {
                "name": "Toyota Hilux / Land Cruiser Mountain Safari 4x4",
                "operator_name": "Everest & Annapurna 4x4 Safaris",
                "vehicle_type": VehicleType.JEEP_4X4,
                "vehicle_number": "BA 2 JHA 1198",
                "total_seats": 6,
                "seat_layout": "JEEP_7",
                "rating": Decimal("5.0"),
                "description": "High end off-road expedition vehicle for private group mountain journeys to Mustang, Kalinchowk, and Solukhumbu.",
                "amenities": ["Turbo Diesel 4x4", "Panoramic Mountain Windows", "Off-Road Winch & Gear", "Spacious Seating", "Bottled Water"],
                "image_url": "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80"
            },
            {
                "name": "BYD & Tata Nexon EV Intercity Cab",
                "operator_name": "Nepal Green Mobility Intercity",
                "vehicle_type": VehicleType.PRIVATE_CAR,
                "vehicle_number": "BA 03 PA 5241",
                "total_seats": 4,
                "seat_layout": "CAB_4",
                "rating": Decimal("4.9"),
                "description": "Zero emission, ultra-quiet, door-to-door private electric car charter. Recharges quickly on Nepal highway charging stations.",
                "amenities": ["100% Electric EV", "Ultra Silent Ride", "Doorstep Pickup & Drop", "Climate Control AC", "Luggage Trunk"],
                "image_url": "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80"
            },
            {
                "name": "Mithila Night Super Deluxe AC Coach",
                "operator_name": "Mithila Yatayat Janakpur",
                "vehicle_type": VehicleType.NIGHT_COACH,
                "vehicle_number": "PR 02-001 KHA 8832",
                "total_seats": 36,
                "seat_layout": "2x2_DELUXE",
                "rating": Decimal("4.6"),
                "description": "Reliable overnight express bus linking Janakpur, Birgunj, and Biratnagar to the capital Kathmandu. Blankets and pillow included.",
                "amenities": ["Air Conditioned", "Overnight Semi-Sleeper", "Warm Blankets", "Highway Dinner Stop", "Safe Night Drivers"],
                "image_url": "https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?auto=format&fit=crop&w=800&q=80"
            }
        ]

        created_vehicles = {}
        for vdata in vehicles_data:
            veh, _ = TransportVehicle.objects.get_or_create(
                name=vdata["name"],
                defaults=vdata
            )
            created_vehicles[vdata["name"]] = veh

        # 2. POPULAR NEPAL ROUTES
        routes_data = [
            {
                "route_name": "Kathmandu -> Pokhara (Prithvi Highway)",
                "from_city": "Kathmandu",
                "to_city": "Pokhara",
                "highway_name": "Prithvi Highway",
                "distance_km": 204,
                "estimated_duration": "6 - 7 Hours",
                "popular_for": "Scenic Trishuli River, Annapurna views, Lakeside tourist hub",
                "boarding_points": [
                    {"stop": "Balaju / Gongabu New Bus Park", "time": "06:30 AM"},
                    {"stop": "Swayambhu Sorhakhutte", "time": "06:45 AM"},
                    {"stop": "Kalanki Petrol Pump Chowk", "time": "07:15 AM"},
                    {"stop": "Nagdhunga Checkpoint", "time": "07:45 AM"}
                ],
                "dropping_points": [
                    {"stop": "Malekhu Highway Stop", "time": "09:30 AM"},
                    {"stop": "Mugling Junction", "time": "11:00 AM"},
                    {"stop": "Damauli Bypass", "time": "12:30 PM"},
                    {"stop": "Prithvi Chowk, Pokhara", "time": "01:30 PM"},
                    {"stop": "Tourist Bus Park, Pokhara", "time": "02:00 PM"}
                ]
            },
            {
                "route_name": "Pokhara -> Kathmandu (Return)",
                "from_city": "Pokhara",
                "to_city": "Kathmandu",
                "highway_name": "Prithvi Highway",
                "distance_km": 204,
                "estimated_duration": "6 - 7 Hours",
                "popular_for": "Safe return corridor with highway lunch stops",
                "boarding_points": [
                    {"stop": "Tourist Bus Park, Pokhara", "time": "07:00 AM"},
                    {"stop": "Prithvi Chowk Pokhara", "time": "07:30 AM"}
                ],
                "dropping_points": [
                    {"stop": "Kalanki Chowk, Kathmandu", "time": "01:30 PM"},
                    {"stop": "Gongabu New Bus Park, Kathmandu", "time": "02:00 PM"}
                ]
            },
            {
                "route_name": "Kathmandu -> Janakpur Dham (BP Highway)",
                "from_city": "Kathmandu",
                "to_city": "Janakpur",
                "highway_name": "BP Highway & East-West Highway",
                "distance_km": 225,
                "estimated_duration": "5.5 - 6 Hours",
                "popular_for": "Picturesque serpentine mountain turns, Koshi & Sunkoshi views, Janaki Temple pilgrimage",
                "boarding_points": [
                    {"stop": "Koteshwor Chowk (Near Bridge)", "time": "06:00 AM"},
                    {"stop": "Jadibuti / Lokanthali", "time": "06:15 AM"},
                    {"stop": "Dhulikhel Bus Stop", "time": "07:00 AM"}
                ],
                "dropping_points": [
                    {"stop": "Khurkot Rest Area", "time": "09:00 AM"},
                    {"stop": "Sindhuli Madi", "time": "10:15 AM"},
                    {"stop": "Bardibas Chowk", "time": "11:30 AM"},
                    {"stop": "Ramanand Chowk, Janakpur", "time": "12:15 PM"},
                    {"stop": "Station Road / Thapa Chowk, Janakpur", "time": "12:30 PM"}
                ]
            },
            {
                "route_name": "Janakpur -> Kathmandu (BP Highway Return)",
                "from_city": "Janakpur",
                "to_city": "Kathmandu",
                "highway_name": "BP Highway",
                "distance_km": 225,
                "estimated_duration": "5.5 - 6 Hours",
                "popular_for": "Fast morning and afternoon commuter departures",
                "boarding_points": [
                    {"stop": "Thapa Chowk / Station Road", "time": "06:00 AM"},
                    {"stop": "Ramanand Chowk, Janakpur", "time": "06:30 AM"},
                    {"stop": "Bardibas Chowk", "time": "07:30 AM"}
                ],
                "dropping_points": [
                    {"stop": "Dhulikhel", "time": "11:00 AM"},
                    {"stop": "Koteshwor Chowk, Kathmandu", "time": "11:45 AM"},
                    {"stop": "Gongabu New Bus Park", "time": "12:30 PM"}
                ]
            },
            {
                "route_name": "Kathmandu -> Chitwan (Sauraha)",
                "from_city": "Kathmandu",
                "to_city": "Chitwan",
                "highway_name": "Prithvi & Narayanghat Corridor",
                "distance_km": 165,
                "estimated_duration": "5 - 6 Hours",
                "popular_for": "Chitwan National Park Safari, Tharu culture, wildlife encounters",
                "boarding_points": [
                    {"stop": "Sorhakhutte / Balaju", "time": "06:45 AM"},
                    {"stop": "Kalanki Chowk", "time": "07:15 AM"}
                ],
                "dropping_points": [
                    {"stop": "Kurintar (Manakamana Cable Car)", "time": "10:00 AM"},
                    {"stop": "Narayanghat Pulchowk", "time": "11:45 AM"},
                    {"stop": "Sauraha Tourist Bus Park", "time": "12:30 PM"}
                ]
            },
            {
                "route_name": "Kathmandu -> Lumbini / Bhairahawa",
                "from_city": "Kathmandu",
                "to_city": "Lumbini",
                "highway_name": "East-West & Siddhartha Highway",
                "distance_km": 295,
                "estimated_duration": "8 - 9 Hours",
                "popular_for": "Birthplace of Lord Buddha, UNESCO World Heritage peace garden",
                "boarding_points": [
                    {"stop": "Gongabu New Bus Park", "time": "06:30 AM"},
                    {"stop": "Kalanki Chowk", "time": "07:00 AM"}
                ],
                "dropping_points": [
                    {"stop": "Butwal Bus Park", "time": "01:30 PM"},
                    {"stop": "Bhairahawa Airport Chowk", "time": "02:30 PM"},
                    {"stop": "Lumbini Gate 5", "time": "03:15 PM"}
                ]
            },
            {
                "route_name": "Pokhara / Beni -> Jomsom & Muktinath 4x4",
                "from_city": "Pokhara",
                "to_city": "Muktinath",
                "highway_name": "Beni-Jomsom Mountain Off-Road Trail",
                "distance_km": 175,
                "estimated_duration": "7 - 8 Hours",
                "popular_for": "Holy Muktinath Temple, Mustang Desert, Kali Gandaki Gorge",
                "boarding_points": [
                    {"stop": "Baglung Bus Park Pokhara", "time": "05:30 AM"},
                    {"stop": "Beni Bazaar Jeep Stand", "time": "08:00 AM"}
                ],
                "dropping_points": [
                    {"stop": "Tatopani Hot Springs", "time": "10:00 AM"},
                    {"stop": "Ghasa & Marpha Apple Orchards", "time": "12:00 PM"},
                    {"stop": "Jomsom Airport Chowk", "time": "01:00 PM"},
                    {"stop": "Muktinath Jeep Station (3,710m)", "time": "02:30 PM"}
                ]
            },
            {
                "route_name": "Kathmandu -> Salleri / Phaplu (Everest Trail 4x4)",
                "from_city": "Kathmandu",
                "to_city": "Salleri",
                "highway_name": "BP & Sagarmatha Highway",
                "distance_km": 270,
                "estimated_duration": "8 - 9 Hours",
                "popular_for": "Budget gateway to Everest Base Camp Trek (avoids Lukla flight delays)",
                "boarding_points": [
                    {"stop": "Chabahil / Koteshwor Chowk", "time": "04:30 AM"}
                ],
                "dropping_points": [
                    {"stop": "Ghurmi Sunkoshi Bridge", "time": "09:30 AM"},
                    {"stop": "Okhaldhunga Bazaar", "time": "11:30 AM"},
                    {"stop": "Salleri Solukhumbu Headquarter", "time": "01:30 PM"}
                ]
            },
            {
                "route_name": "Kathmandu -> Kalinchowk (Kuri Village 4x4)",
                "from_city": "Kathmandu",
                "to_city": "Kalinchowk",
                "highway_name": "Araniko & Charikot Highway",
                "distance_km": 145,
                "estimated_duration": "5 - 6 Hours",
                "popular_for": "Snowfall in winter, Bhagwati Temple pilgrimage, cable car views",
                "boarding_points": [
                    {"stop": "Koteshwor / Jadibuti Chowk", "time": "06:00 AM"}
                ],
                "dropping_points": [
                    {"stop": "Dolakha Charikot Bazaar", "time": "10:30 AM"},
                    {"stop": "Kuri Village (3,450m)", "time": "12:00 PM"}
                ]
            }
        ]

        created_routes = {}
        for rdata in routes_data:
            route, _ = TransportRoute.objects.get_or_create(
                route_name=rdata["route_name"],
                from_city=rdata["from_city"],
                to_city=rdata["to_city"],
                defaults=rdata
            )
            created_routes[rdata["route_name"]] = route

        # 3. SCHEDULES (Linking vehicles & routes with real Nepal fares)
        schedules_data = [
            # Kathmandu -> Pokhara VIP Sofa Bus
            {
                "vehicle": created_vehicles["Jagadamba VIP 2x1 Sofa Tourist Bus"],
                "route": created_routes["Kathmandu ➔ Pokhara (Prithvi Highway)"],
                "departure_time": "07:00:00",
                "arrival_time": "13:30:00",
                "shift": ShiftType.MORNING,
                "pricing_type": PricingType.PER_SEAT,
                "fare_npr": Decimal("1600.00"),
            },
            # Kathmandu -> Pokhara Swift Deluxe
            {
                "vehicle": created_vehicles["Swift Holiday Deluxe Tourist Coach"],
                "route": created_routes["Kathmandu ➔ Pokhara (Prithvi Highway)"],
                "departure_time": "07:30:00",
                "arrival_time": "14:00:00",
                "shift": ShiftType.MORNING,
                "pricing_type": PricingType.PER_SEAT,
                "fare_npr": Decimal("1200.00"),
            },
            # Kathmandu -> Pokhara EV Cab (Whole Vehicle)
            {
                "vehicle": created_vehicles["BYD & Tata Nexon EV Intercity Cab"],
                "route": created_routes["Kathmandu ➔ Pokhara (Prithvi Highway)"],
                "departure_time": "08:00:00",
                "arrival_time": "13:30:00",
                "shift": ShiftType.FLEXIBLE,
                "pricing_type": PricingType.WHOLE_VEHICLE,
                "fare_npr": Decimal("13500.00"),
            },
            # Pokhara -> Kathmandu Morning VIP Bus
            {
                "vehicle": created_vehicles["Jagadamba VIP 2x1 Sofa Tourist Bus"],
                "route": created_routes["Pokhara ➔ Kathmandu (Return)"],
                "departure_time": "07:30:00",
                "arrival_time": "14:00:00",
                "shift": ShiftType.MORNING,
                "pricing_type": PricingType.PER_SEAT,
                "fare_npr": Decimal("1600.00"),
            },
            # Kathmandu -> Janakpur HiAce Microbus (BP Highway)
            {
                "vehicle": created_vehicles["Super BP HiAce Express (High Speed)"],
                "route": created_routes["Kathmandu ➔ Janakpur Dham (BP Highway)"],
                "departure_time": "06:30:00",
                "arrival_time": "12:00:00",
                "shift": ShiftType.MORNING,
                "pricing_type": PricingType.PER_SEAT,
                "fare_npr": Decimal("1050.00"),
            },
            # Kathmandu -> Janakpur Afternoon HiAce
            {
                "vehicle": created_vehicles["Super BP HiAce Express (High Speed)"],
                "route": created_routes["Kathmandu ➔ Janakpur Dham (BP Highway)"],
                "departure_time": "12:30:00",
                "arrival_time": "18:00:00",
                "shift": ShiftType.MORNING,
                "pricing_type": PricingType.PER_SEAT,
                "fare_npr": Decimal("1050.00"),
            },
            # Janakpur -> Kathmandu Morning HiAce
            {
                "vehicle": created_vehicles["Super BP HiAce Express (High Speed)"],
                "route": created_routes["Janakpur ➔ Kathmandu (BP Highway Return)"],
                "departure_time": "06:30:00",
                "arrival_time": "12:00:00",
                "shift": ShiftType.MORNING,
                "pricing_type": PricingType.PER_SEAT,
                "fare_npr": Decimal("1050.00"),
            },
            # Kathmandu -> Janakpur Overnight Deluxe Coach
            {
                "vehicle": created_vehicles["Mithila Night Super Deluxe AC Coach"],
                "route": created_routes["Kathmandu ➔ Janakpur Dham (BP Highway)"],
                "departure_time": "20:00:00",
                "arrival_time": "05:00:00",
                "shift": ShiftType.NIGHT,
                "pricing_type": PricingType.PER_SEAT,
                "fare_npr": Decimal("1100.00"),
            },
            # Kathmandu -> Chitwan Sauraha Tourist Bus
            {
                "vehicle": created_vehicles["Swift Holiday Deluxe Tourist Coach"],
                "route": created_routes["Kathmandu ➔ Chitwan (Sauraha)"],
                "departure_time": "07:00:00",
                "arrival_time": "12:30:00",
                "shift": ShiftType.MORNING,
                "pricing_type": PricingType.PER_SEAT,
                "fare_npr": Decimal("1100.00"),
            },
            # Kathmandu -> Lumbini VIP Tourist Bus
            {
                "vehicle": created_vehicles["Jagadamba VIP 2x1 Sofa Tourist Bus"],
                "route": created_routes["Kathmandu ➔ Lumbini / Bhairahawa"],
                "departure_time": "06:30:00",
                "arrival_time": "15:00:00",
                "shift": ShiftType.MORNING,
                "pricing_type": PricingType.PER_SEAT,
                "fare_npr": Decimal("1800.00"),
            },
            # Pokhara -> Muktinath 4WD Scorpio Mountain Jeep (Per Seat)
            {
                "vehicle": created_vehicles["Himalayan 4WD Mahindra Scorpio / Sumo"],
                "route": created_routes["Pokhara / Beni ➔ Jomsom & Muktinath 4x4"],
                "departure_time": "06:00:00",
                "arrival_time": "14:00:00",
                "shift": ShiftType.MORNING,
                "pricing_type": PricingType.PER_SEAT,
                "fare_npr": Decimal("2600.00"),
            },
            # Pokhara -> Muktinath Land Cruiser Private Charter (Whole Vehicle)
            {
                "vehicle": created_vehicles["Toyota Hilux / Land Cruiser Mountain Safari 4x4"],
                "route": created_routes["Pokhara / Beni ➔ Jomsom & Muktinath 4x4"],
                "departure_time": "06:30:00",
                "arrival_time": "13:30:00",
                "shift": ShiftType.FLEXIBLE,
                "pricing_type": PricingType.WHOLE_VEHICLE,
                "fare_npr": Decimal("24000.00"),
            },
            # Kathmandu -> Salleri (Everest Trail) 4x4 Jeep
            {
                "vehicle": created_vehicles["Himalayan 4WD Mahindra Scorpio / Sumo"],
                "route": created_routes["Kathmandu ➔ Salleri / Phaplu (Everest Trail 4x4)"],
                "departure_time": "04:30:00",
                "arrival_time": "13:30:00",
                "shift": ShiftType.MORNING,
                "pricing_type": PricingType.PER_SEAT,
                "fare_npr": Decimal("2400.00"),
            },
            # Kathmandu -> Kalinchowk Snow Mountain 4x4
            {
                "vehicle": created_vehicles["Himalayan 4WD Mahindra Scorpio / Sumo"],
                "route": created_routes["Kathmandu ➔ Kalinchowk (Kuri Village 4x4)"],
                "departure_time": "06:00:00",
                "arrival_time": "12:00:00",
                "shift": ShiftType.MORNING,
                "pricing_type": PricingType.PER_SEAT,
                "fare_npr": Decimal("1500.00"),
            }
        ]

        for sdata in schedules_data:
            TransportSchedule.objects.get_or_create(
                vehicle=sdata["vehicle"],
                route=sdata["route"],
                departure_time=sdata["departure_time"],
                defaults=sdata
            )

        return {
            "message": "Successfully seeded Nepal roadway transport network.",
            "vehicles": TransportVehicle.objects.count(),
            "routes": TransportRoute.objects.count(),
            "schedules": TransportSchedule.objects.count()
        }
