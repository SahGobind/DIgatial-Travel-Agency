"""
Serializers for Flight Ticket Request API and Fare Estimations.
"""

from rest_framework import serializers
from django.utils import timezone
from .models import TicketRequest, TripType, TravelClass, TicketStatus
from apps.users.serializers import UserResponseSerializer


class TicketRequestSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and viewing flight ticket requests.
    """
    customer_details = UserResponseSerializer(source='customer', read_only=True)
    trip_type = serializers.ChoiceField(choices=TripType.choices, default=TripType.ONE_WAY)
    travel_class = serializers.ChoiceField(choices=TravelClass.choices, default=TravelClass.ECONOMY)
    status = serializers.ChoiceField(choices=TicketStatus.choices, default=TicketStatus.PENDING, read_only=True)
    admin_notes = serializers.CharField(read_only=True, required=False)
    quotation_amount_npr = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True, required=False)

    class Meta:
        model = TicketRequest
        fields = [
            'id',
            'customer',
            'customer_details',
            'trip_type',
            'from_location',
            'to_location',
            'departure_date',
            'return_date',
            'adults',
            'children',
            'travel_class',
            'special_request',
            'status',
            'admin_notes',
            'quotation_amount_npr',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'customer', 'customer_details', 'status', 'admin_notes', 'quotation_amount_npr', 'created_at', 'updated_at']

    def validate_adults(self, value):
        if value < 1:
            raise serializers.ValidationError("Number of adults must be at least 1.")
        return value

    def validate_children(self, value):
        if value < 0:
            raise serializers.ValidationError("Number of children cannot be negative.")
        return value

    def validate_departure_date(self, value):
        today = timezone.now().date()
        if value < today:
            raise serializers.ValidationError("Departure date cannot be in the past.")
        return value

    def validate(self, attrs):
        trip_type = attrs.get('trip_type', TripType.ONE_WAY)
        departure_date = attrs.get('departure_date')
        return_date = attrs.get('return_date')

        if trip_type == TripType.ROUND_TRIP:
            if not return_date:
                raise serializers.ValidationError({"return_date": "Return date is required for round-trip flights."})
            if departure_date and return_date < departure_date:
                raise serializers.ValidationError({"return_date": "Return date cannot be earlier than departure date."})
        elif trip_type == TripType.ONE_WAY and return_date:
            attrs['return_date'] = None

        return attrs


class TicketRequestAdminUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for Admins and Staff to update status, quotation, and processing notes.
    """
    status = serializers.ChoiceField(choices=TicketStatus.choices, required=False)
    admin_notes = serializers.CharField(required=False, allow_blank=True)
    quotation_amount_npr = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)

    class Meta:
        model = TicketRequest
        fields = [
            'status',
            'admin_notes',
            'quotation_amount_npr',
            'trip_type',
            'from_location',
            'to_location',
            'departure_date',
            'return_date',
            'adults',
            'children',
            'travel_class',
            'special_request',
        ]


class TicketRequestCustomerUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for Customers to update details or cancel own pending requests.
    """
    status = serializers.ChoiceField(choices=[TicketStatus.CANCELLED], required=False)

    class Meta:
        model = TicketRequest
        fields = [
            'trip_type',
            'from_location',
            'to_location',
            'departure_date',
            'return_date',
            'adults',
            'children',
            'travel_class',
            'special_request',
            'status',
        ]

    def validate_departure_date(self, value):
        today = timezone.now().date()
        if value < today:
            raise serializers.ValidationError("Departure date cannot be in the past.")
        return value

    def validate(self, attrs):
        trip_type = attrs.get('trip_type', getattr(self.instance, 'trip_type', TripType.ONE_WAY))
        departure_date = attrs.get('departure_date', getattr(self.instance, 'departure_date', None))
        return_date = attrs.get('return_date', getattr(self.instance, 'return_date', None))

        if trip_type == TripType.ROUND_TRIP:
            if not return_date:
                raise serializers.ValidationError({"return_date": "Return date is required for round-trip flights."})
            if departure_date and return_date < departure_date:
                raise serializers.ValidationError({"return_date": "Return date cannot be earlier than departure date."})
        return attrs


class TicketFareEstimateSerializer(serializers.Serializer):
    """
    Serializer for flight fare estimation calculator.
    """
    fromCity = serializers.CharField(max_length=100, required=False, default='Kathmandu (KTM)')
    toCity = serializers.CharField(max_length=100, required=False, default='Dubai (DXB)')
    from_location = serializers.CharField(max_length=100, required=False)
    to_location = serializers.CharField(max_length=100, required=False)
    flightType = serializers.ChoiceField(choices=['international', 'domestic'], default='international', required=False)
    cabinClass = serializers.CharField(default='economy', required=False)
    travel_class = serializers.CharField(default='ECONOMY', required=False)


class FlightSearchSerializer(serializers.Serializer):
    """
    Serializer for searching live flights across airlines.
    """
    origin = serializers.CharField(max_length=100, default='Kathmandu (KTM)')
    destination = serializers.CharField(max_length=100, default='Dubai (DXB)')
    departure_date = serializers.DateField(required=True)
    return_date = serializers.DateField(required=False, allow_null=True)
    adults = serializers.IntegerField(default=1, min_value=1, max_value=9)
    children = serializers.IntegerField(default=0, min_value=0, max_value=9)
    cabin_class = serializers.ChoiceField(choices=TravelClass.choices, default=TravelClass.ECONOMY)
    trip_type = serializers.ChoiceField(choices=TripType.choices, default=TripType.ONE_WAY)


class FlightRepriceSerializer(serializers.Serializer):
    """
    Serializer for confirming flight offer price and inventory.
    """
    offer_id = serializers.CharField(max_length=100, required=True)
    price_data = serializers.DictField(required=False)


class FlightAirPriceRequestSerializer(serializers.Serializer):
    """
    STEP 25: Serializer for POST /api/v1/flights/price/
    Contains identifiers/reference needed to price selected Travelport offer.
    """
    offer_id = serializers.CharField(max_length=150, required=True)
    displayed_price = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)
    adults = serializers.IntegerField(default=1, min_value=1, max_value=9, required=False)
    children = serializers.IntegerField(default=0, min_value=0, max_value=9, required=False)
    cabin = serializers.CharField(max_length=50, default='ECONOMY', required=False)



class FlightPassengerSerializer(serializers.Serializer):
    """
    STEP 26: Comprehensive Passenger Details Serializer.
    Validates name standards, passenger type, age boundaries, passport rules & meal/assistance preferences.
    """
    passenger_type = serializers.ChoiceField(
        choices=['ADULT', 'CHILD', 'INFANT'],
        default='ADULT'
    )
    title = serializers.ChoiceField(
        choices=['MR', 'MRS', 'MS', 'MISS', 'MASTER', 'DR'],
        default='MR'
    )
    first_name = serializers.CharField(max_length=100, min_length=2)
    last_name = serializers.CharField(max_length=100, min_length=2)
    gender = serializers.ChoiceField(choices=['MALE', 'FEMALE', 'OTHER'], default='MALE')
    date_of_birth = serializers.DateField(required=True)
    nationality = serializers.CharField(max_length=50, default='Nepal')
    document_type = serializers.ChoiceField(
        choices=['PASSPORT', 'NATIONAL_ID', 'CITIZENSHIP'],
        default='PASSPORT'
    )
    passport_number = serializers.CharField(max_length=50, required=False, allow_blank=True, default='')
    document_number = serializers.CharField(max_length=50, required=False, allow_blank=True, default='')
    document_expiry_date = serializers.DateField(required=False, allow_null=True)
    document_issuing_country = serializers.CharField(max_length=50, default='Nepal', required=False)
    frequent_flyer_number = serializers.CharField(max_length=50, required=False, allow_blank=True, default='')
    meal_preference = serializers.ChoiceField(
        choices=['STANDARD', 'VEGETARIAN', 'HALAL', 'KOSHER', 'DIABETIC', 'GLUTEN_FREE'],
        default='STANDARD',
        required=False
    )
    special_assistance = serializers.ChoiceField(
        choices=['NONE', 'WHEELCHAIR', 'BLIND', 'DEAF', 'ELDERLY_ASSIST'],
        default='NONE',
        required=False
    )

    def validate_first_name(self, value):
        cleaned = value.strip()
        if not all(c.isalpha() or c in " -'" for c in cleaned):
            raise serializers.ValidationError("First name must contain only letters, hyphens, or spaces.")
        return cleaned.upper()

    def validate_last_name(self, value):
        cleaned = value.strip()
        if not all(c.isalpha() or c in " -'" for c in cleaned):
            raise serializers.ValidationError("Last name must contain only letters, hyphens, or spaces.")
        return cleaned.upper()

    def validate(self, attrs):
        dob = attrs.get('date_of_birth')
        p_type = attrs.get('passenger_type', 'ADULT')
        today = timezone.now().date()

        if dob:
            if dob > today:
                raise serializers.ValidationError({"date_of_birth": "Date of birth cannot be in the future."})
            
            # Calculate age in years
            age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
            
            if p_type == 'ADULT' and age < 12:
                raise serializers.ValidationError({"date_of_birth": f"Adult passenger must be at least 12 years old (calculated age: {age})."})
            elif p_type == 'CHILD' and not (2 <= age < 12):
                raise serializers.ValidationError({"date_of_birth": f"Child passenger must be between 2 and 11 years old (calculated age: {age})."})
            elif p_type == 'INFANT' and age >= 2:
                raise serializers.ValidationError({"date_of_birth": f"Infant passenger must be under 2 years old (calculated age: {age})."})

        # Normalize document number
        doc_num = attrs.get('document_number') or attrs.get('passport_number') or ''
        attrs['document_number'] = doc_num.strip().upper()
        attrs['passport_number'] = doc_num.strip().upper()

        # Check passport expiry
        doc_expiry = attrs.get('document_expiry_date')
        if doc_expiry and doc_expiry <= today:
            raise serializers.ValidationError({"document_expiry_date": "Travel document has expired. Must be valid for travel."})

        return attrs


class FlightContactInfoSerializer(serializers.Serializer):
    """
    Primary contact details for booking confirmation and flight updates.
    """
    contact_name = serializers.CharField(max_length=150)
    contact_email = serializers.EmailField()
    contact_phone = serializers.CharField(max_length=20)
    emergency_contact_name = serializers.CharField(max_length=150, required=False, allow_blank=True, default='')
    emergency_contact_phone = serializers.CharField(max_length=20, required=False, allow_blank=True, default='')


class FlightPassengerValidationSerializer(serializers.Serializer):
    """
    Validates a batch of passengers and contact info before reservation creation.
    """
    passengers = FlightPassengerSerializer(many=True)
    contact_info = FlightContactInfoSerializer(required=False)


class FlightBookingSerializer(serializers.Serializer):
    """
    Serializer for booking flight offer and generating PNR.
    """
    offer_id = serializers.CharField(max_length=100, required=True)
    trip_type = serializers.ChoiceField(choices=TripType.choices, default=TripType.ONE_WAY)
    from_location = serializers.CharField(max_length=255)
    to_location = serializers.CharField(max_length=255)
    departure_date = serializers.DateField()
    return_date = serializers.DateField(required=False, allow_null=True)
    travel_class = serializers.ChoiceField(choices=TravelClass.choices, default=TravelClass.ECONOMY)
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    special_request = serializers.CharField(required=False, allow_blank=True, default='')
    passengers = FlightPassengerSerializer(many=True)
    contact_info = FlightContactInfoSerializer(required=False)
    payment_method = serializers.CharField(max_length=50, default='ESEWA')
    payment_reference = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')

