import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Plane, 
  ArrowRight, 
  Calendar, 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  PhoneCall, 
  Sparkles, 
  Clock, 
  Send, 
  MapPin, 
  ArrowLeftRight,
  User,
  Phone,
  Mail,
  RotateCcw,
  AlertCircle,
  Search,
  Filter,
  Luggage,
  Ticket,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  CreditCard,
  Download,
  Info,
  SlidersHorizontal,
  Flame,
  Utensils,
  Wifi,
  Zap,
  ArrowUpDown,
  Check,
  Timer,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import Container from '../../components/common/Container';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import { ticketService, flightService } from '../../services';
import { useAuth } from '../../context/AuthContext';

export const TicketRequestPage = () => {
  const { user, loginAsDemoCustomer, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('liveSearch'); // 'liveSearch' | 'quoteInquiry'
  const [tripType, setTripType] = useState('oneWay'); // 'oneWay' | 'roundTrip'
  const [cabinClass, setCabinClass] = useState('ECONOMY');
  
  // Live Search States (STEP 25)
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [selectedStopsFilter, setSelectedStopsFilter] = useState('ALL'); // 'ALL' | 'DIRECT' | '1_STOP'
  const [selectedAirlineFilter, setSelectedAirlineFilter] = useState('ALL');
  const [selectedSort, setSelectedSort] = useState('CHEAPEST'); // 'CHEAPEST' | 'FASTEST' | 'EARLIEST' | 'LATEST' | 'EXPENSIVE'
  const [expandedOfferId, setExpandedOfferId] = useState(null);

  // STEP 25-29: Multi-Step Booking Wizard States
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [selectedFareTier, setSelectedFareTier] = useState('STANDARD'); // 'STANDARD' | 'FLEX' | 'SUPER_FLEX'
  const [bookingStep, setBookingStep] = useState(1); // 1: Fare Review, 2: Passengers, 3: Payment, 4: Confirmed E-Ticket
  const [activePaxTab, setActivePaxTab] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isRepricing, setIsRepricing] = useState(false);
  const [repricedOfferData, setRepricedOfferData] = useState(null);
  const [priceChangeAlert, setPriceChangeAlert] = useState(null); // { oldPrice, newPrice, accepted: false }
  const [unavailableAlert, setUnavailableAlert] = useState('');
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState(null);
  const [bookingError, setBookingError] = useState('');
  const [priceLockSeconds, setPriceLockSeconds] = useState(900); // 15 minutes TTL
  const [paymentMethod, setPaymentMethod] = useState('ESEWA'); // 'ESEWA' | 'KHALTI' | 'CONNECT_IPS' | 'CARD'
  
  // STEP 30: PNR Lookup Tool States
  const [pnrSearchInput, setPnrSearchInput] = useState('');
  const [pnrSearchResult, setPnrSearchResult] = useState(null);
  const [isPnrSearching, setIsPnrSearching] = useState(false);
  const [pnrSearchError, setPnrSearchError] = useState('');

  // STEP 31: Cancellation Modal States
  const [cancellationModalOpen, setCancellationModalOpen] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancellationSummary, setCancellationSummary] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // STEP 26: Passenger state with ICAO/IATA fields
  const [passengers, setPassengers] = useState([
    {
      passenger_type: 'ADULT',
      title: 'MR',
      first_name: user?.name?.split(' ')[0] || 'RAM',
      last_name: user?.name?.split(' ').slice(1).join(' ') || 'SHRESTHA',
      gender: 'MALE',
      date_of_birth: '1992-06-15',
      nationality: 'Nepal',
      document_type: 'PASSPORT',
      passport_number: 'N1849204',
      document_expiry_date: '2030-10-15',
      document_issuing_country: 'Nepal',
      meal_preference: 'STANDARD',
      special_assistance: 'NONE',
    }
  ]);

  // Primary Contact Info
  const [contactInfo, setContactInfo] = useState({
    contact_name: user?.name || 'Ram Shrestha',
    contact_email: user?.email || 'customer@digitalworldtravels.com',
    contact_phone: user?.phone || '+977 9812193621',
    emergency_contact_name: 'Sita Shrestha',
    emergency_contact_phone: '+977 9800000000',
  });

  // Offline Quote State
  const [submittedData, setSubmittedData] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    getValues,
    setValue,
  } = useForm({
    defaultValues: {
      from: 'Kathmandu (KTM)',
      to: 'Dubai (DXB)',
      adults: '1',
      children: '0',
      travelClass: 'Economy',
      departureDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      returnDate: '',
      fullName: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      specialRequest: '',
    },
  });

  // Dual Mode Combobox (Type & Click Dropdown) States & Outside Click Refs
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);
  const [fromFilterText, setFromFilterText] = useState('Kathmandu (KTM)');
  const [toFilterText, setToFilterText] = useState('Dubai (DXB)');

  const fromComboboxRef = useRef(null);
  const toComboboxRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fromComboboxRef.current && !fromComboboxRef.current.contains(event.target)) {
        setIsFromOpen(false);
      }
      if (toComboboxRef.current && !toComboboxRef.current.contains(event.target)) {
        setIsToOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const AIRPORTS_CATALOG = [
    // Nepal Domestic Hubs
    { code: 'KTM', name: 'Kathmandu (KTM)', city: 'Kathmandu', country: 'Nepal', flag: '🇳🇵', airport: 'Tribhuvan International Airport', type: 'Domestic / Int. Hub' },
    { code: 'JKR', name: 'Janakpur (JKR)', city: 'Janakpur Dham', country: 'Nepal', flag: '🇳🇵', airport: 'Janakpur Airport', type: 'Domestic Flight' },
    { code: 'PKR', name: 'Pokhara (PKR)', city: 'Pokhara', country: 'Nepal', flag: '🇳🇵', airport: 'Pokhara International Airport', type: 'Domestic Flight' },
    { code: 'BIR', name: 'Biratnagar (BIR)', city: 'Biratnagar', country: 'Nepal', flag: '🇳🇵', airport: 'Biratnagar Airport', type: 'Domestic Flight' },
    { code: 'BWA', name: 'Bhairahawa (BWA)', city: 'Gautam Buddha', country: 'Nepal', flag: '🇳🇵', airport: 'Gautam Buddha Int. Airport', type: 'Domestic Flight' },
    { code: 'KEP', name: 'Nepalgunj (KEP)', city: 'Nepalgunj', country: 'Nepal', flag: '🇳🇵', airport: 'Nepalgunj Airport', type: 'Domestic Flight' },
    { code: 'DHI', name: 'Dhangadhi (DHI)', city: 'Dhangadhi', country: 'Nepal', flag: '🇳🇵', airport: 'Dhangadhi Airport', type: 'Domestic Flight' },
    // Middle East & Gulf (Top Nepal Airlines & International routes)
    { code: 'DXB', name: 'Dubai (DXB)', city: 'Dubai', country: 'United Arab Emirates', flag: '🇦🇪', airport: 'Dubai International Airport', type: 'Direct Nepal Airlines' },
    { code: 'DOH', name: 'Doha (DOH)', city: 'Doha', country: 'Qatar', flag: '🇶🇦', airport: 'Hamad International Airport', type: 'Direct Nepal Airlines' },
    { code: 'RUH', name: 'Riyadh (RUH)', city: 'Riyadh', country: 'Saudi Arabia', flag: '🇸🇦', airport: 'King Khalid Int. Airport', type: 'Direct Flight' },
    { code: 'JED', name: 'Jeddah (JED)', city: 'Jeddah', country: 'Saudi Arabia', flag: '🇸🇦', airport: 'King Abdulaziz Int. Airport', type: 'International' },
    { code: 'DMM', name: 'Dammam (DMM)', city: 'Dammam', country: 'Saudi Arabia', flag: '🇸🇦', airport: 'King Fahd Int. Airport', type: 'Direct Nepal Airlines' },
    { code: 'KWI', name: 'Kuwait (KWI)', city: 'Kuwait City', country: 'Kuwait', flag: '🇰🇼', airport: 'Kuwait International Airport', type: 'International' },
    { code: 'MCT', name: 'Muscat (MCT)', city: 'Muscat', country: 'Oman', flag: '🇴🇲', airport: 'Muscat International Airport', type: 'International' },
    { code: 'BAH', name: 'Bahrain (BAH)', city: 'Manama', country: 'Bahrain', flag: '🇧🇭', airport: 'Bahrain International Airport', type: 'International' },
    // India & Southeast Asia
    { code: 'DEL', name: 'Delhi (DEL)', city: 'New Delhi', country: 'India', flag: '🇮🇳', airport: 'Indira Gandhi Int. Airport', type: 'Direct Nepal Airlines' },
    { code: 'BOM', name: 'Mumbai (BOM)', city: 'Mumbai', country: 'India', flag: '🇮🇳', airport: 'Chhatrapati Shivaji Maharaj Int.', type: 'Direct Nepal Airlines' },
    { code: 'KUL', name: 'Kuala Lumpur (KUL)', city: 'Kuala Lumpur', country: 'Malaysia', flag: '🇲🇾', airport: 'Kuala Lumpur Int. Airport', type: 'Direct Nepal Airlines' },
    { code: 'BKK', name: 'Bangkok (BKK)', city: 'Bangkok', country: 'Thailand', flag: '🇹🇭', airport: 'Suvarnabhumi Airport', type: 'Direct Nepal Airlines' },
    { code: 'SIN', name: 'Singapore (SIN)', city: 'Singapore', country: 'Singapore', flag: '🇸🇬', airport: 'Singapore Changi Airport', type: 'International' },
    { code: 'NRT', name: 'Tokyo (NRT)', city: 'Tokyo', country: 'Japan', flag: '🇯🇵', airport: 'Narita International Airport', type: 'Direct Nepal Airlines' },
    // Long Haul
    { code: 'LHR', name: 'London (LHR)', city: 'London', country: 'United Kingdom', flag: '🇬🇧', airport: 'Heathrow Airport', type: 'International' },
    { code: 'SYD', name: 'Sydney (SYD)', city: 'Sydney', country: 'Australia', flag: '🇦🇺', airport: 'Sydney Kingsford Smith', type: 'International' },
  ];

  const popularAirports = AIRPORTS_CATALOG.map(a => a.name);

  // Auto-search on page load to display live flights immediately
  useEffect(() => {
    handleLiveFlightSearch();
  }, []);

  // 15-Minute Price Lock Timer countdown
  useEffect(() => {
    let interval = null;
    if (isBookingModalOpen && priceLockSeconds > 0) {
      interval = setInterval(() => {
        setPriceLockSeconds(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBookingModalOpen, priceLockSeconds]);

  const formatPriceLockTimer = () => {
    const mins = Math.floor(priceLockSeconds / 60);
    const secs = priceLockSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Perform Live Flight Search (React ➔ Django ➔ Flight API)
  const handleLiveFlightSearch = async (e, overrideClass = null, overrideTripType = null) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsSearching(true);
    setSearchError('');
    setUnavailableAlert('');
    setExpandedOfferId(null);

    const targetClass = overrideClass || cabinClass;
    const targetTripType = overrideTripType || tripType;

    const values = getValues();
    const originVal = fromFilterText || values.from || 'Kathmandu (KTM)';
    const destinationVal = toFilterText || values.to || 'Dubai (DXB)';

    const payload = {
      origin: originVal,
      destination: destinationVal,
      departure_date: values.departureDate || new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      return_date: targetTripType === 'roundTrip' ? (values.returnDate || null) : null,
      adults: parseInt(values.adults, 10) || 1,
      children: parseInt(values.children, 10) || 0,
      cabin_class: targetClass,
      trip_type: targetTripType === 'roundTrip' ? 'ROUND_TRIP' : 'ONE_WAY',
    };

    try {
      const res = await flightService.searchFlights(payload);
      const data = res?.data || res;
      setSearchResults(data);
    } catch (err) {
      setSearchError(err.customMessage || err.message || 'Unable to fetch flight offers. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Swap Origin and Destination
  const handleSwapAirports = () => {
    const currentFrom = fromFilterText || getValues('from');
    const currentTo = toFilterText || getValues('to');
    setFromFilterText(currentTo);
    setToFilterText(currentFrom);
    setValue('from', currentTo);
    setValue('to', currentFrom);
  };

  // STEP 25: FLIGHT OFFER RE-PRICING (Travelport AirPrice)
  const handleSelectOffer = async (offer) => {
    setSelectedOffer(offer);
    setSelectedFareTier('STANDARD');
    setBookingStep(1);
    setActivePaxTab(0);
    setPriceLockSeconds(900); // 15 mins
    setIsRepricing(true);
    setBookingError('');
    setPriceChangeAlert(null);
    setUnavailableAlert('');
    setRepricedOfferData(null);

    const values = getValues();
    const adultsCount = parseInt(values.adults, 10) || 1;
    const childrenCount = parseInt(values.children, 10) || 0;
    const totalCount = adultsCount + childrenCount;

    // STEP 26: Initialize passenger rows matching total passenger count
    const initialPax = Array.from({ length: totalCount }, (_, idx) => {
      const isChild = idx >= adultsCount;
      return {
        passenger_type: isChild ? 'CHILD' : 'ADULT',
        title: isChild ? 'MASTER' : 'MR',
        first_name: idx === 0 ? (user?.name?.split(' ')[0] || 'RAM') : (isChild ? `CHILD${idx}` : `TRAVELER${idx + 1}`),
        last_name: idx === 0 ? (user?.name?.split(' ').slice(1).join(' ') || 'SHRESTHA') : 'SHRESTHA',
        gender: 'MALE',
        date_of_birth: isChild ? '2018-04-12' : '1992-06-15',
        nationality: 'Nepal',
        document_type: 'PASSPORT',
        passport_number: 'N' + Math.floor(10000000 + Math.random() * 90000000),
        document_expiry_date: '2030-10-15',
        document_issuing_country: 'Nepal',
        meal_preference: 'STANDARD',
        special_assistance: 'NONE',
      };
    });
    setPassengers(initialPax);

    try {
      // POST /api/v1/flights/price/
      const pricePayload = {
        offer_id: offer.offer_id,
        displayed_price: offer.pricing?.total_amount,
        adults: adultsCount,
        children: childrenCount,
        cabin: cabinClass,
      };

      const res = await flightService.priceOffer(pricePayload);
      const data = res?.data || res;

      // Handle Price Status Responses
      if (data.price_status === 'UNAVAILABLE') {
        setUnavailableAlert('This flight is no longer available in the airline reservation system.');
        setIsBookingModalOpen(false);
        return;
      }

      setRepricedOfferData(data);
      setIsBookingModalOpen(true);

      if (data.price_status === 'PRICE_CHANGED') {
        setPriceChangeAlert({
          oldPrice: data.old_price || offer.pricing?.total_amount,
          newPrice: data.total,
          accepted: false,
        });
      }
    } catch (err) {
      if (err.status === 410 || err.response?.status === 410) {
        setUnavailableAlert('This flight is no longer available.');
        setIsBookingModalOpen(false);
      } else {
        setBookingError(err.customMessage || err.message || 'Unable to confirm current price with Travelport AirPrice.');
        setIsBookingModalOpen(true);
      }
    } finally {
      setIsRepricing(false);
    }
  };

  // Passenger field update handler
  const handlePassengerChange = (index, field, value) => {
    setPassengers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Calculate tier surcharge
  const getTierSurcharge = () => {
    if (selectedFareTier === 'FLEX') return 2500 * (passengers.length || 1);
    if (selectedFareTier === 'SUPER_FLEX') return 5000 * (passengers.length || 1);
    return 0;
  };

  // Authoritative Base Total from Travelport AirPrice response
  const getAuthoritativeTotal = () => {
    const baseTotal = repricedOfferData?.total || selectedOffer?.pricing?.total_amount || 0;
    return baseTotal + getTierSurcharge();
  };

  // STEP 26: Validate passenger details before moving to payment
  const handleProceedToPayment = async () => {
    setBookingError('');
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.first_name?.trim() || !p.last_name?.trim()) {
        setBookingError(`Passenger #${i + 1} first name and last name are required.`);
        setActivePaxTab(i);
        return;
      }
      if (!p.passport_number?.trim()) {
        setBookingError(`Passenger #${i + 1} travel document / passport number is required.`);
        setActivePaxTab(i);
        return;
      }
    }

    try {
      setIsBookingSubmitting(true);
      await flightService.validatePassengers({
        passengers,
        contact_info: contactInfo,
      });
      setBookingStep(3); // Advance to payment
    } catch (err) {
      setBookingError(err.customMessage || err.message || 'Passenger details validation failed. Please check names and passport expiry.');
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  // STEP 27-29: Confirm booking, GDS PNR creation & Instant E-Ticket Issuance
  const handleConfirmBooking = async () => {
    if (!selectedOffer) return;
    if (priceChangeAlert && !priceChangeAlert.accepted) {
      setBookingError('Please confirm and accept the new flight price before proceeding.');
      return;
    }

    setIsBookingSubmitting(true);
    setBookingError('');

    if (!isAuthenticated) {
      try {
        await loginAsDemoCustomer();
      } catch (authErr) {
        // continue
      }
    }

    const finalAmount = getAuthoritativeTotal();

    const payload = {
      offer_id: selectedOffer.offer_id,
      trip_type: selectedOffer.trip_type,
      from_location: selectedOffer.origin,
      to_location: selectedOffer.destination,
      departure_date: selectedOffer.departure_date,
      return_date: selectedOffer.return_date,
      travel_class: selectedOffer.cabin_class,
      total_amount: finalAmount,
      special_request: `Selected flight: ${selectedOffer.airline.name} (${selectedOffer.flight_number}) [Tier: ${selectedFareTier}]`,
      passengers: passengers.map(p => ({
        ...p,
        first_name: p.first_name || 'RAM',
        last_name: p.last_name || 'SHRESTHA',
      })),
      contact_info: contactInfo,
      payment_method: paymentMethod,
      payment_reference: `${paymentMethod}-${Date.now().toString().slice(-6)}`,
    };

    try {
      const res = await flightService.createBooking(payload);
      const data = res?.data || res;
      setBookingSuccessData(data);
      setBookingStep(4);
    } catch (err) {
      setBookingError(err.customMessage || err.message || 'Failed to complete booking. Please try again.');
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  // STEP 30: Look up live flight booking by PNR
  const handlePnrSearch = async (e) => {
    if (e) e.preventDefault();
    if (!pnrSearchInput.trim()) return;

    setIsPnrSearching(true);
    setPnrSearchError('');
    setPnrSearchResult(null);

    try {
      const res = await flightService.getBookingByPnr(pnrSearchInput.trim());
      setPnrSearchResult(res?.data || res);
    } catch (err) {
      setPnrSearchError(err.customMessage || err.message || `No booking found for PNR "${pnrSearchInput}".`);
    } finally {
      setIsPnrSearching(false);
    }
  };

  // STEP 31: Handle cancellation workflow
  const handleOpenCancelModal = (booking) => {
    setCancellingBooking(booking);
    setCancellationSummary(null);
    setCancellationModalOpen(true);
  };

  const handleExecuteCancellation = async () => {
    if (!cancellingBooking) return;
    setIsCancelling(true);
    try {
      const res = await flightService.cancelBooking(cancellingBooking.id || cancellingBooking.rawId || 1);
      setCancellationSummary(res?.data || res);
    } catch (err) {
      alert(err.customMessage || err.message || 'Cancellation request failed.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Offline Quote Submission
  const onSubmitQuote = async (data) => {
    try {
      setApiError('');
      if (!isAuthenticated) {
        try {
          await loginAsDemoCustomer();
        } catch (authErr) {
          // continue
        }
      }

      const response = await ticketService.createTicket({
        ...data,
        tripType,
      });

      const referenceId = `DW-TKT-${new Date().getFullYear()}-${response.id || Math.floor(1000 + Math.random() * 9000)}`;
      setSubmittedData({ ...data, tripType, referenceId, id: response.id });
      setIsSuccessModalOpen(true);
    } catch (err) {
      setApiError(err.customMessage || err.message || 'Failed to submit ticket request. Please try again.');
    }
  };

  // Unique airlines list in current results
  const availableAirlinesInResults = Array.from(
    new Set((searchResults?.offers || []).map(o => JSON.stringify({ code: o.airline.code, name: o.airline.name })))
  ).map(s => JSON.parse(s));

  // Helper to parse duration string like "4h 30m" into total minutes
  const parseDurationMinutes = (durStr) => {
    if (!durStr) return 0;
    const hoursMatch = String(durStr).match(/(\d+)\s*h/i);
    const minsMatch = String(durStr).match(/(\d+)\s*m/i);
    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const mins = minsMatch ? parseInt(minsMatch[1], 10) : 0;
    return hours * 60 + mins;
  };

  // Helper to get numeric total price
  const getOfferPrice = (offer) => {
    return Number(offer?.pricing?.total_amount ?? offer?.pricing?.price_per_adult ?? offer?.price ?? 0);
  };

  // STEP 26: Filtering & Sorting Engine
  let processedOffers = [...(searchResults?.offers || [])].filter(offer => {
    if (selectedStopsFilter === 'DIRECT' && offer.stops !== 0) return false;
    if (selectedStopsFilter === '1_STOP' && offer.stops !== 1) return false;
    if (selectedAirlineFilter !== 'ALL' && offer.airline.code !== selectedAirlineFilter) return false;
    return true;
  });

  processedOffers.sort((a, b) => {
    if (selectedSort === 'CHEAPEST') {
      return getOfferPrice(a) - getOfferPrice(b);
    } else if (selectedSort === 'EXPENSIVE') {
      return getOfferPrice(b) - getOfferPrice(a);
    } else if (selectedSort === 'FASTEST') {
      return parseDurationMinutes(a.duration) - parseDurationMinutes(b.duration);
    } else if (selectedSort === 'EARLIEST') {
      return (a.departure_time || '').localeCompare(b.departure_time || '');
    } else if (selectedSort === 'LATEST') {
      return (b.departure_time || '').localeCompare(a.departure_time || '');
    }
    return 0;
  });

  return (
    <div className="w-full pb-20">
      {/* Page Header */}
      <PageHeader
        badge="Live Airline GDS & Ticketing"
        title="Flight Search & Instant Booking"
        subtitle="Search live flight schedules across major airlines, compare lowest fares, and issue instant confirmed PNRs."
        breadcrumbs={[
          { label: 'Services', to: '/services' },
          { label: 'Flight Tickets' },
        ]}
      />

      <Container className="mt-8 sm:mt-10">
        {/* Navigation Tabs: Live Search vs Offline Inquiry */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-8">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('liveSearch')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'liveSearch'
                  ? 'bg-[#0B2A6F] text-white shadow-md'
                  : 'text-slate-600 hover:text-[#0B2A6F]'
              }`}
            >
              <Search className="w-4 h-4" />
              Live Flight Search (Instant API)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('quoteInquiry')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'quoteInquiry'
                  ? 'bg-[#0B2A6F] text-white shadow-md'
                  : 'text-slate-600 hover:text-[#0B2A6F]'
              }`}
            >
              <Send className="w-4 h-4" />
              Custom Travel Agent Quote
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Travelport GDS AirPrice &amp; NDC Online
          </div>
        </div>

        {/* Global Unavailable Warning if Flight sold out */}
        {unavailableAlert && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-sm flex items-center justify-between gap-3 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2.5 font-bold">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>{unavailableAlert}</span>
            </div>
            <button
              type="button"
              onClick={() => setUnavailableAlert('')}
              className="text-xs font-bold text-amber-700 hover:text-amber-950 underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ================= TAB 1: LIVE FLIGHT SEARCH & RESULTS UI ================= */}
        {activeTab === 'liveSearch' && (
          <div className="space-y-8">
            {/* Search Query Bar */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative z-30">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100 mb-6 relative z-10">
                <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setTripType('oneWay');
                      handleLiveFlightSearch(null, null, 'oneWay');
                    }}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      tripType === 'oneWay' ? 'bg-[#0B2A6F] text-white shadow-sm' : 'text-slate-600 hover:text-[#0B2A6F]'
                    }`}
                  >
                    One Way
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTripType('roundTrip');
                      handleLiveFlightSearch(null, null, 'roundTrip');
                    }}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      tripType === 'roundTrip' ? 'bg-[#0B2A6F] text-white shadow-sm' : 'text-slate-600 hover:text-[#0B2A6F]'
                    }`}
                  >
                    Round Trip
                  </button>
                </div>

                {/* Cabin Class Selection */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                  {[
                    { key: 'ECONOMY', label: 'ECONOMY' },
                    { key: 'PREMIUM_ECONOMY', label: 'PREMIUM ECONOMY' },
                    { key: 'BUSINESS', label: 'BUSINESS' },
                    { key: 'FIRST', label: 'FIRST' },
                  ].map((cls) => (
                    <button
                      key={cls.key}
                      type="button"
                      onClick={() => {
                        setCabinClass(cls.key);
                        setValue('travelClass', cls.key);
                        handleLiveFlightSearch(null, cls.key);
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        cabinClass === cls.key
                          ? 'bg-[#0B2A6F] text-white shadow-sm font-extrabold'
                          : 'text-slate-600 hover:text-[#0B2A6F] hover:bg-slate-200'
                      }`}
                    >
                      {cls.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Form Inputs */}
              <form onSubmit={handleLiveFlightSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end relative z-10">
                {/* From (Origin) Dual-Mode Combobox */}
                <div ref={fromComboboxRef} className="lg:col-span-3 relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      From (Origin)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsFromOpen(!isFromOpen);
                        setIsToOpen(false);
                      }}
                      className="text-[11px] font-bold text-[#0B2A6F] hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      Browse {isFromOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#0B2A6F] absolute left-3 top-3.5 pointer-events-none" />
                    <input
                      type="text"
                      value={fromFilterText}
                      onChange={(e) => {
                        setFromFilterText(e.target.value);
                        setValue('from', e.target.value);
                      }}
                      onFocus={() => {
                        setIsFromOpen(true);
                        setIsToOpen(false);
                      }}
                      placeholder="Type city, code or airport..."
                      className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-300 text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2A6F]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsFromOpen(!isFromOpen);
                        setIsToOpen(false);
                      }}
                      className="absolute right-2.5 top-3 text-slate-400 hover:text-[#0B2A6F] cursor-pointer"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isFromOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* Dual Mode Dropdown Menu for Origin */}
                  {isFromOpen && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 p-2 max-h-72 overflow-y-auto space-y-1 animate-in fade-in">
                      <div className="p-2 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Select Origin Airport</span>
                        <button type="button" onClick={() => setIsFromOpen(false)} className="text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer">Close</button>
                      </div>

                      {AIRPORTS_CATALOG.filter(a => 
                        !fromFilterText ||
                        a.name.toLowerCase().includes(fromFilterText.toLowerCase()) ||
                        a.city.toLowerCase().includes(fromFilterText.toLowerCase()) ||
                        a.code.toLowerCase().includes(fromFilterText.toLowerCase())
                      ).map((apt) => (
                        <button
                          key={apt.code}
                          type="button"
                          onClick={() => {
                            setFromFilterText(apt.name);
                            setValue('from', apt.name);
                            setIsFromOpen(false);
                          }}
                          className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between hover:bg-blue-50 transition-colors cursor-pointer ${
                            fromFilterText === apt.name ? 'bg-blue-50/80 border border-blue-200' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{apt.flag}</span>
                            <div>
                              <div className="font-extrabold text-xs text-[#0B2A6F] flex items-center gap-1.5">
                                {apt.city}
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 font-mono text-slate-700 font-bold">{apt.code}</span>
                              </div>
                              <div className="text-[10px] text-slate-500">{apt.airport}</div>
                            </div>
                          </div>
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                            apt.type.includes('Nepal Airlines') ? 'bg-red-50 text-red-700 font-black' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {apt.type}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Quick Select Origin Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {['Kathmandu (KTM)', 'Janakpur (JKR)', 'Pokhara (PKR)'].map(apt => (
                      <button
                        key={apt}
                        type="button"
                        onClick={() => {
                          setFromFilterText(apt);
                          setValue('from', apt);
                        }}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition cursor-pointer ${
                          fromFilterText === apt
                            ? 'bg-[#0B2A6F] text-white border-[#0B2A6F]'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-[#0B2A6F]'
                        }`}
                      >
                        {apt.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Swap Button */}
                <div className="hidden lg:flex lg:col-span-1 justify-center pb-4">
                  <button
                    type="button"
                    onClick={handleSwapAirports}
                    title="Swap Route"
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer shadow-sm hover:scale-105"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </button>
                </div>

                {/* To (Destination) Dual-Mode Combobox */}
                <div ref={toComboboxRef} className="lg:col-span-3 relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      To (Destination)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsToOpen(!isToOpen);
                        setIsFromOpen(false);
                      }}
                      className="text-[11px] font-bold text-[#D71920] hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      Browse {isToOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#D71920] absolute left-3 top-3.5 pointer-events-none" />
                    <input
                      type="text"
                      value={toFilterText}
                      onChange={(e) => {
                        setToFilterText(e.target.value);
                        setValue('to', e.target.value);
                      }}
                      onFocus={() => {
                        setIsToOpen(true);
                        setIsFromOpen(false);
                      }}
                      placeholder="Type city, code or airport..."
                      className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-300 text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2A6F]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsToOpen(!isToOpen);
                        setIsFromOpen(false);
                      }}
                      className="absolute right-2.5 top-3 text-slate-400 hover:text-[#0B2A6F] cursor-pointer"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isToOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* Dual Mode Dropdown Menu for Destination */}
                  {isToOpen && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 p-2 max-h-72 overflow-y-auto space-y-1 animate-in fade-in">
                      <div className="p-2 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Select Destination</span>
                        <button type="button" onClick={() => setIsToOpen(false)} className="text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer">Close</button>
                      </div>

                      {AIRPORTS_CATALOG.filter(a => 
                        !toFilterText ||
                        a.name.toLowerCase().includes(toFilterText.toLowerCase()) ||
                        a.city.toLowerCase().includes(toFilterText.toLowerCase()) ||
                        a.code.toLowerCase().includes(toFilterText.toLowerCase())
                      ).map((apt) => (
                        <button
                          key={apt.code}
                          type="button"
                          onClick={() => {
                            setToFilterText(apt.name);
                            setValue('to', apt.name);
                            setIsToOpen(false);
                          }}
                          className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between hover:bg-red-50 transition-colors cursor-pointer ${
                            toFilterText === apt.name ? 'bg-red-50/80 border border-red-200' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{apt.flag}</span>
                            <div>
                              <div className="font-extrabold text-xs text-[#0B2A6F] flex items-center gap-1.5">
                                {apt.city}
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 font-mono text-slate-700 font-bold">{apt.code}</span>
                              </div>
                              <div className="text-[10px] text-slate-500">{apt.airport}</div>
                            </div>
                          </div>
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                            apt.type.includes('Nepal Airlines') ? 'bg-red-100 text-red-700 font-black' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {apt.type}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Quick Select Destination Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {['Dubai (DXB)', 'Doha (DOH)', 'Delhi (DEL)', 'Kuala Lumpur (KUL)', 'Bangkok (BKK)'].map(apt => (
                      <button
                        key={apt}
                        type="button"
                        onClick={() => {
                          setToFilterText(apt);
                          setValue('to', apt);
                        }}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition cursor-pointer ${
                          toFilterText === apt
                            ? 'bg-[#D71920] text-white border-[#D71920]'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-[#D71920]'
                        }`}
                      >
                        {apt.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Departure Date */}
                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Departure Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="date"
                      {...register('departureDate')}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2A6F]"
                    />
                  </div>
                </div>

                {/* Adults / Travelers */}
                <div className="lg:col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Travelers
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-400 absolute left-2.5 top-3.5" />
                    <select
                      {...register('adults')}
                      className="w-full pl-8 pr-2 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2A6F]"
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4+</option>
                    </select>
                  </div>
                </div>

                {/* Submit Search Button */}
                <div className="lg:col-span-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full justify-center py-2.5 h-[44px] bg-[#0B2A6F] hover:bg-[#071b48] text-white shadow-md font-bold cursor-pointer"
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Searching...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        Search Flights
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {searchError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}

            {/* Results Grid */}
            {searchResults && (
              <div className="space-y-4">
                {/* Result Control Bar: Filters & Sorting */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-[#0B2A6F]">
                      {processedOffers.length} Flights Available
                    </span>
                    <span className="text-xs text-slate-500">
                      • {searchResults.search_query.origin} ➔ {searchResults.search_query.destination}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0B2A6F] border border-blue-200">
                      {cabinClass.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Filter & Sort Controls */}
                  <div className="flex flex-wrap items-center gap-3 text-xs w-full md:w-auto">
                    {/* Stops Filter */}
                    <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setSelectedStopsFilter('ALL')}
                        className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          selectedStopsFilter === 'ALL' ? 'bg-[#0B2A6F] text-white shadow-sm' : 'text-slate-600'
                        }`}
                      >
                        All Stops
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedStopsFilter('DIRECT')}
                        className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          selectedStopsFilter === 'DIRECT' ? 'bg-[#0B2A6F] text-white shadow-sm' : 'text-slate-600'
                        }`}
                      >
                        Non-Stop
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedStopsFilter('1_STOP')}
                        className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          selectedStopsFilter === '1_STOP' ? 'bg-[#0B2A6F] text-white shadow-sm' : 'text-slate-600'
                        }`}
                      >
                        1 Stop
                      </button>
                    </div>

                    {/* Sorting Dropdown */}
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-500 font-semibold">Sort:</span>
                      <select
                        value={selectedSort}
                        onChange={(e) => setSelectedSort(e.target.value)}
                        className="bg-transparent font-bold text-[#0B2A6F] focus:outline-none cursor-pointer pr-1"
                      >
                        <option value="CHEAPEST">Cheapest Fare</option>
                        <option value="FASTEST">Shortest Duration</option>
                        <option value="EARLIEST">Earliest Departure</option>
                        <option value="LATEST">Latest Departure</option>
                        <option value="EXPENSIVE">Highest Fare</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Airline Filter Pills */}
                {availableAirlinesInResults.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                    <span className="text-slate-400 font-semibold whitespace-nowrap">Airlines:</span>
                    <button
                      type="button"
                      onClick={() => setSelectedAirlineFilter('ALL')}
                      className={`px-3 py-1 rounded-full font-bold transition-colors whitespace-nowrap ${
                        selectedAirlineFilter === 'ALL'
                          ? 'bg-[#0B2A6F] text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
                      }`}
                    >
                      All Airlines
                    </button>
                    {availableAirlinesInResults.map(a => (
                      <button
                        key={a.code}
                        type="button"
                        onClick={() => setSelectedAirlineFilter(a.code)}
                        className={`px-3 py-1 rounded-full font-bold transition-colors whitespace-nowrap ${
                          selectedAirlineFilter === a.code
                            ? 'bg-[#0B2A6F] text-white'
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
                        }`}
                      >
                        {a.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* Flight Offer Cards */}
                <div className="space-y-4">
                  {processedOffers.map((offer) => {
                    const isExpanded = expandedOfferId === offer.offer_id;
                    const isSelected = selectedOffer?.offer_id === offer.offer_id;

                    return (
                      <div
                        key={offer.offer_id}
                        className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden ${
                          isSelected
                            ? 'border-[#0B2A6F] ring-2 ring-[#0B2A6F]/20 shadow-xl'
                            : 'border-slate-200 hover:border-[#0B2A6F] hover:shadow-xl'
                        }`}
                      >
                        {/* Main Card Header */}
                        <div className="p-5 sm:p-6 flex flex-col lg:flex-row items-center justify-between gap-6">
                          {/* 1. Airline Info */}
                          <div className="flex items-center gap-4 w-full lg:w-1/4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                              {offer.airline.logo}
                            </div>
                            <div>
                              <div className="text-base font-black text-[#0B2A6F] leading-tight flex items-center gap-1.5">
                                {offer.airline.name}
                                {isSelected && (
                                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                                    ✓
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                                <span className="font-bold">{offer.flight_number}</span>
                                <span>•</span>
                                <span className="text-emerald-600 font-bold">★ {offer.airline.rating}</span>
                              </div>
                            </div>
                          </div>

                          {/* 2. Departure ➔ Duration ➔ Arrival */}
                          <div className="flex items-center justify-between w-full lg:w-2/5 px-2">
                            {/* Departure */}
                            <div className="text-left">
                              <div className="text-2xl font-black text-[#172033] font-mono">
                                {offer.departure_time}
                              </div>
                              <div className="text-xs font-bold text-slate-600">
                                {offer.origin.split(' ')[0]}
                              </div>
                            </div>

                            {/* Duration & Flight Line Visual */}
                            <div className="flex flex-col items-center px-4 flex-1">
                              <span className="text-[11px] font-bold text-slate-400 mb-1">{offer.duration}</span>
                              <div className="w-full flex items-center">
                                <div className="h-0.5 flex-1 bg-slate-300"></div>
                                <div className="mx-1.5 text-[#0B2A6F]">
                                  <Plane className="w-4 h-4 transform rotate-90" />
                                </div>
                                <div className="h-0.5 flex-1 bg-slate-300"></div>
                              </div>
                              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full mt-1.5 ${
                                offer.stops === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {offer.stops === 0 ? 'Non-Stop Direct' : `1 Stop (${offer.stopover_airport})`}
                              </span>
                            </div>

                            {/* Arrival */}
                            <div className="text-right">
                              <div className="text-2xl font-black text-[#172033] font-mono">
                                {offer.arrival_time}
                              </div>
                              <div className="text-xs font-bold text-slate-600">
                                {offer.destination.split(' ')[0]}
                              </div>
                            </div>
                          </div>

                          {/* 3. Inclusions & Baggage */}
                          <div className="hidden sm:flex flex-col gap-1.5 text-xs text-slate-600 w-full lg:w-1/6 border-l border-slate-100 lg:pl-5">
                            <div className="flex items-center gap-1.5 font-bold text-[#0B2A6F]">
                              <Luggage className="w-3.5 h-3.5" />
                              <span>{offer.baggage.split('+')[0]}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <span>Cabin: {offer.baggage.split('+')[1] || '7 kg'}</span>
                            </div>
                            <div className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                              <Flame className="w-3.5 h-3.5 animate-bounce" />
                              <span>{offer.seats_available} seats left</span>
                            </div>
                          </div>

                          {/* 4. Pricing & Action (STEP 25: Trigger Travelport AirPrice) */}
                          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full lg:w-1/4 border-t lg:border-t-0 border-slate-100 pt-4 lg:pt-0">
                            <div className="text-left sm:text-right">
                              <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Displayed Fare</div>
                              <div className="text-2xl font-black text-[#D71920]">
                                NPR {offer.pricing.total_amount.toLocaleString()}
                              </div>
                              <div className="text-[10px] text-emerald-600 font-semibold">Taxes &amp; Fees Included</div>
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                              <button
                                type="button"
                                onClick={() => setExpandedOfferId(isExpanded ? null : offer.offer_id)}
                                className="text-xs font-bold text-slate-500 hover:text-[#0B2A6F] flex items-center gap-1 px-2.5 py-2 rounded-xl hover:bg-slate-50"
                              >
                                {isExpanded ? 'Hide' : 'Details'}
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>

                              <Button
                                variant="primary"
                                size="sm"
                                disabled={isRepricing && selectedOffer?.offer_id === offer.offer_id}
                                onClick={() => handleSelectOffer(offer)}
                                className={`px-5 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-md ${
                                  isSelected
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                    : 'bg-[#0B2A6F] hover:bg-[#071b48] text-white'
                                }`}
                              >
                                {isRepricing && selectedOffer?.offer_id === offer.offer_id ? (
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Re-pricing...
                                  </span>
                                ) : (
                                  <>
                                    {isSelected ? 'Selected' : 'Select Flight'}
                                    <ChevronRight className="w-4 h-4" />
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Expandable Flight Details Drawer */}
                        {isExpanded && (
                          <div className="bg-slate-50/80 border-t border-slate-100 p-5 sm:p-6 text-xs text-slate-700 animate-in slide-in-from-top-2 duration-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {/* Itinerary Timeline */}
                              <div className="space-y-2">
                                <h5 className="font-extrabold text-[#0B2A6F] uppercase tracking-wider text-[11px]">Flight Timeline</h5>
                                <div className="space-y-1.5 text-slate-600">
                                  <div>🛫 <strong>Departure:</strong> {offer.origin} at {offer.departure_time}</div>
                                  <div>⏱️ <strong>Flight Duration:</strong> {offer.duration} ({offer.stops === 0 ? 'Direct Non-Stop' : `1 Stop via ${offer.stopover_airport}`})</div>
                                  <div>🛬 <strong>Arrival:</strong> {offer.destination} at {offer.arrival_time}</div>
                                </div>
                              </div>

                              {/* Fare Breakdown */}
                              <div className="space-y-2">
                                <h5 className="font-extrabold text-[#0B2A6F] uppercase tracking-wider text-[11px]">Transparent Fare Breakdown</h5>
                                <div className="space-y-1 text-slate-600">
                                  <div className="flex justify-between">
                                    <span>Base Airfare:</span>
                                    <span className="font-mono font-bold">NPR {offer.pricing.base_fare.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Airport Taxes &amp; Surcharges:</span>
                                    <span className="font-mono font-bold">NPR {offer.pricing.taxes_and_surcharges.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between pt-1 border-t border-slate-200 font-extrabold text-[#0B2A6F]">
                                    <span>Total Amount (NPR):</span>
                                    <span className="font-mono text-[#D71920]">NPR {offer.pricing.total_amount.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Inclusions & Policies */}
                              <div className="space-y-2">
                                <h5 className="font-extrabold text-[#0B2A6F] uppercase tracking-wider text-[11px]">Inclusions &amp; Policies</h5>
                                <div className="space-y-1.5 text-slate-600">
                                  <div>🧳 <strong>Baggage Allowance:</strong> {offer.baggage}</div>
                                  <div>🍽️ <strong>Meal:</strong> {offer.meal_included ? 'Complimentary In-Flight Meal' : 'Buy On-Board'}</div>
                                  <div>🔄 <strong>Cancellation:</strong> {offer.refundable ? 'Refundable (Airline fees apply)' : 'Non-Refundable Ticket'}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: OFFLINE TRAVEL AGENT QUOTE INQUIRY ================= */}
        {activeTab === 'quoteInquiry' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* LEFT: FLIGHT REQUEST FORM */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm">
              <div className="border-b border-slate-100 pb-6 mb-6">
                <h2 className="text-2xl font-extrabold text-[#0B2A6F]">
                  Flight Quotation Request
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Looking for customized group bookings, visa bundles, or complex itineraries? Submit your inquiry below.
                </p>
              </div>

              {apiError && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <span>{apiError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmitQuote)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      From (Origin) *
                    </label>
                    <input
                      type="text"
                      list="quote-origins-list"
                      placeholder="e.g. Kathmandu (KTM) or City"
                      {...register('from', { required: 'Departure city is required' })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2A6F]"
                    />
                    <datalist id="quote-origins-list">
                      {popularAirports.map(a => <option key={a} value={a} />)}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      To (Destination) *
                    </label>
                    <input
                      type="text"
                      list="quote-destinations-list"
                      placeholder="e.g. Dubai (DXB) or City"
                      {...register('to', { required: 'Destination is required' })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2A6F]"
                    />
                    <datalist id="quote-destinations-list">
                      {popularAirports.map(a => <option key={a} value={a} />)}
                    </datalist>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Departure Date *
                    </label>
                    <input
                      type="date"
                      {...register('departureDate', { required: 'Departure date is required' })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2A6F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      {...register('fullName', { required: 'Name is required' })}
                      placeholder="e.g. Ram Bahadur Thapa"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2A6F]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      {...register('phone', { required: 'Phone is required' })}
                      placeholder="e.g. 9812193621"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2A6F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      {...register('email', { required: 'Email is required' })}
                      placeholder="e.g. ram@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2A6F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Special Inquiries or Preferred Airlines
                  </label>
                  <textarea
                    {...register('specialRequest')}
                    rows={3}
                    placeholder="e.g. Need Nepal Airlines direct flight, vegetarian meals, wheelchair assistance..."
                    className="w-full p-4 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2A6F]"
                  ></textarea>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full justify-center bg-[#0B2A6F] hover:bg-[#071b48] text-white"
                  disabled={isSubmitting}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Flight Request
                </Button>
              </form>
            </div>

            {/* RIGHT: CONTACT / ASSISTANCE SIDEBAR */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#F5F8FC] rounded-3xl p-6 sm:p-8 border border-slate-200">
                <h3 className="text-lg font-bold text-[#0B2A6F] mb-3">Live Ticketing Desk</h3>
                <p className="text-xs text-slate-600 mb-4">
                  Need urgent flight changes or ticketing assistance in Janakpur Dham? Speak directly with our flight desk:
                </p>
                <div className="space-y-2 text-sm font-bold text-[#0B2A6F]">
                  <a href="tel:9702022094" className="block p-3 rounded-xl bg-white border border-slate-200 hover:border-[#0B2A6F]">
                    📞 +977-9702022094
                  </a>
                  <a href="tel:9812193621" className="block p-3 rounded-xl bg-white border border-slate-200 hover:border-[#0B2A6F]">
                    📞 +977-9812193621
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>

      {/* ================= MODAL: MULTI-STEP FLIGHT BOOKING & E-TICKET WIZARD (STEPS 26-29) ================= */}
      {isBookingModalOpen && selectedOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header & Price Lock Timer */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase text-[#0B2A6F] bg-blue-50 px-3 py-1 rounded-full">
                    Travelport AirPrice Verified
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5 animate-pulse" />
                    {formatPriceLockTimer()} Price Lock
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-[#172033] mt-2">
                  {bookingStep === 1 && 'Step 1: Fare Review & Package'}
                  {bookingStep === 2 && 'Step 2: Passenger & Travel Documents (IATA)'}
                  {bookingStep === 3 && 'Step 3: Secure Payment & GDS Issuance'}
                  {bookingStep === 4 && 'Step 4: Flight Confirmed & Official E-Ticket'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Progress Indicators */}
            <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-bold">
              <div className={`p-2 rounded-xl border ${bookingStep >= 1 ? 'bg-[#0B2A6F] text-white border-[#0B2A6F]' : 'bg-slate-50 text-slate-400'}`}>
                1. Fare
              </div>
              <div className={`p-2 rounded-xl border ${bookingStep >= 2 ? 'bg-[#0B2A6F] text-white border-[#0B2A6F]' : 'bg-slate-50 text-slate-400'}`}>
                2. Passengers
              </div>
              <div className={`p-2 rounded-xl border ${bookingStep >= 3 ? 'bg-[#0B2A6F] text-white border-[#0B2A6F]' : 'bg-slate-50 text-slate-400'}`}>
                3. Payment
              </div>
              <div className={`p-2 rounded-xl border ${bookingStep >= 4 ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                4. E-Ticket
              </div>
            </div>

            {/* STEP 25: PRICE CHANGED WARNING BANNER */}
            {priceChangeAlert && !priceChangeAlert.accepted && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2.5 animate-in slide-in-from-top-2">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>The flight price has changed.</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-white p-3 rounded-xl border border-amber-200">
                  <div>
                    <span className="text-slate-500">Old displayed price:</span>{' '}
                    <span className="line-through text-slate-400 font-bold">NPR {priceChangeAlert.oldPrice?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-700 font-semibold">Current confirmed price:</span>{' '}
                    <span className="font-extrabold text-[#D71920] text-sm">NPR {priceChangeAlert.newPrice?.toLocaleString()}</span>
                  </div>
                </div>
                <p className="text-[11px] text-amber-700">
                  Airline revenue management has updated the seat inventory. Please confirm if you wish to proceed with the updated rate.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setPriceChangeAlert({ ...priceChangeAlert, accepted: true })}
                  className="w-full justify-center bg-amber-700 hover:bg-amber-800 text-white font-bold py-2 rounded-xl"
                >
                  <Check className="w-4 h-4 mr-1.5" />
                  Accept New Price &amp; Continue
                </Button>
              </div>
            )}

            {/* Selected Offer Summary Pill (Authoritative GDS Values) */}
            <div className="p-4 rounded-2xl bg-[#F5F8FC] border border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-slate-500">Selected Airline Schedule</div>
                <div className="text-sm font-extrabold text-[#0B2A6F]">
                  {selectedOffer.airline.name} ({selectedOffer.flight_number}) • {selectedOffer.origin} → {selectedOffer.destination}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Dep: {selectedOffer.departure_time} | Arr: {selectedOffer.arrival_time} ({selectedOffer.duration}) | Class: {selectedOffer.cabin_class}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold text-slate-500">Authoritative Total</div>
                <div className="text-2xl font-black text-[#D71920]">
                  NPR {getAuthoritativeTotal().toLocaleString()}
                </div>
                <div className="text-[10px] text-emerald-600 font-bold">● GDS Confirmed</div>
              </div>
            </div>

            {bookingError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            {/* ----------------- STEP 1: FARE REVIEW & TIERS ----------------- */}
            {bookingStep === 1 && (
              <div className="space-y-4">
                {repricedOfferData?.price_breakdown && (
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs space-y-1 text-slate-600">
                    <div className="flex justify-between">
                      <span>Base Airfare:</span>
                      <span className="font-mono font-bold">NPR {repricedOfferData.price_breakdown.base_airfare?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Airport Taxes &amp; Surcharges:</span>
                      <span className="font-mono font-bold">NPR {(repricedOfferData.price_breakdown.airport_taxes + repricedOfferData.price_breakdown.fuel_surcharge)?.toLocaleString()}</span>
                    </div>
                    {getTierSurcharge() > 0 && (
                      <div className="flex justify-between text-blue-700 font-bold">
                        <span>Fare Tier Upgrade ({selectedFareTier}):</span>
                        <span className="font-mono">+NPR {getTierSurcharge().toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Choose Fare Package Tier
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div
                      onClick={() => setSelectedFareTier('STANDARD')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        selectedFareTier === 'STANDARD'
                          ? 'border-[#0B2A6F] bg-blue-50/40 ring-1 ring-[#0B2A6F]'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-xs text-[#0B2A6F]">Standard</span>
                        <span className="text-[11px] font-bold text-slate-500">Included</span>
                      </div>
                      <ul className="text-[11px] text-slate-600 space-y-0.5">
                        <li>• 30 kg Checked Bag</li>
                        <li>• Standard Seat</li>
                      </ul>
                    </div>

                    <div
                      onClick={() => setSelectedFareTier('FLEX')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        selectedFareTier === 'FLEX'
                          ? 'border-[#0B2A6F] bg-blue-50/40 ring-1 ring-[#0B2A6F]'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-xs text-[#0B2A6F]">Flex Fare</span>
                        <span className="text-[11px] font-bold text-emerald-600">+NPR 2,500</span>
                      </div>
                      <ul className="text-[11px] text-slate-600 space-y-0.5">
                        <li>• Free Date Change</li>
                        <li>• Seat Selection</li>
                      </ul>
                    </div>

                    <div
                      onClick={() => setSelectedFareTier('SUPER_FLEX')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        selectedFareTier === 'SUPER_FLEX'
                          ? 'border-[#0B2A6F] bg-blue-50/40 ring-1 ring-[#0B2A6F]'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-xs text-[#0B2A6F]">Super Flex</span>
                        <span className="text-[11px] font-bold text-emerald-600">+NPR 5,000</span>
                      </div>
                      <ul className="text-[11px] text-slate-600 space-y-0.5">
                        <li>• Full Refundable</li>
                        <li>• Priority Boarding</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-100">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full sm:w-auto bg-[#0B2A6F] text-white"
                    onClick={() => setBookingStep(2)}
                  >
                    Continue to Passenger Details <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* ----------------- STEP 2: PASSENGER DETAILS (STEP 26) ----------------- */}
            {bookingStep === 2 && (
              <div className="space-y-4">
                {/* Passenger Navigation Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
                  {passengers.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePaxTab(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        activePaxTab === idx
                          ? 'bg-[#0B2A6F] text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Traveler #{idx + 1} ({p.passenger_type})
                    </button>
                  ))}
                </div>

                {/* Active Passenger Form */}
                {passengers[activePaxTab] && (
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Type</label>
                        <select
                          value={passengers[activePaxTab].passenger_type}
                          onChange={(e) => handlePassengerChange(activePaxTab, 'passenger_type', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none"
                        >
                          <option value="ADULT">Adult (12+ yrs)</option>
                          <option value="CHILD">Child (2-11 yrs)</option>
                          <option value="INFANT">Infant (&lt;2 yrs)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Title</label>
                        <select
                          value={passengers[activePaxTab].title}
                          onChange={(e) => handlePassengerChange(activePaxTab, 'title', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none"
                        >
                          <option value="MR">Mr</option>
                          <option value="MRS">Mrs</option>
                          <option value="MS">Ms</option>
                          <option value="MISS">Miss</option>
                          <option value="MASTER">Master</option>
                          <option value="DR">Dr</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">First &amp; Middle Name *</label>
                        <input
                          type="text"
                          value={passengers[activePaxTab].first_name}
                          onChange={(e) => handlePassengerChange(activePaxTab, 'first_name', e.target.value.toUpperCase())}
                          placeholder="As on passport"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none uppercase font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Last Name / Surname *</label>
                        <input
                          type="text"
                          value={passengers[activePaxTab].last_name}
                          onChange={(e) => handlePassengerChange(activePaxTab, 'last_name', e.target.value.toUpperCase())}
                          placeholder="Surname"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none uppercase font-semibold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Gender</label>
                        <select
                          value={passengers[activePaxTab].gender}
                          onChange={(e) => handlePassengerChange(activePaxTab, 'gender', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none"
                        >
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Date of Birth *</label>
                        <input
                          type="date"
                          value={passengers[activePaxTab].date_of_birth}
                          onChange={(e) => handlePassengerChange(activePaxTab, 'date_of_birth', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nationality</label>
                        <input
                          type="text"
                          value={passengers[activePaxTab].nationality}
                          onChange={(e) => handlePassengerChange(activePaxTab, 'nationality', e.target.value)}
                          placeholder="Nepal"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Document Type</label>
                        <select
                          value={passengers[activePaxTab].document_type}
                          onChange={(e) => handlePassengerChange(activePaxTab, 'document_type', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none"
                        >
                          <option value="PASSPORT">Passport</option>
                          <option value="NATIONAL_ID">National ID / Citizenship</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Passport / Doc Number *</label>
                        <input
                          type="text"
                          value={passengers[activePaxTab].passport_number}
                          onChange={(e) => handlePassengerChange(activePaxTab, 'passport_number', e.target.value.toUpperCase())}
                          placeholder="e.g. N1849204"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none font-mono uppercase"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Doc Expiration Date</label>
                        <input
                          type="date"
                          value={passengers[activePaxTab].document_expiry_date}
                          onChange={(e) => handlePassengerChange(activePaxTab, 'document_expiry_date', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Meal Preference</label>
                        <select
                          value={passengers[activePaxTab].meal_preference}
                          onChange={(e) => handlePassengerChange(activePaxTab, 'meal_preference', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none"
                        >
                          <option value="STANDARD">Standard Airline Meal</option>
                          <option value="VEGETARIAN">Vegetarian Meal (VGML)</option>
                          <option value="HALAL">Halal Meal (MOML)</option>
                          <option value="KOSHER">Kosher Meal (KSML)</option>
                          <option value="DIABETIC">Diabetic Meal (DBML)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Special Assistance</label>
                        <select
                          value={passengers[activePaxTab].special_assistance}
                          onChange={(e) => handlePassengerChange(activePaxTab, 'special_assistance', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none"
                        >
                          <option value="NONE">None Required</option>
                          <option value="WHEELCHAIR">Wheelchair Assistance (WCHR)</option>
                          <option value="ELDERLY_ASSIST">Elderly Meet &amp; Assist</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Primary Contact Details */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-[#F8FAFC] space-y-3">
                  <h5 className="text-xs font-extrabold text-[#0B2A6F] uppercase tracking-wider">
                    Primary Contact &amp; Flight Updates
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Contact Name</label>
                      <input
                        type="text"
                        value={contactInfo.contact_name}
                        onChange={(e) => setContactInfo({ ...contactInfo, contact_name: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email (For E-Ticket)</label>
                      <input
                        type="email"
                        value={contactInfo.contact_email}
                        onChange={(e) => setContactInfo({ ...contactInfo, contact_email: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Mobile / WhatsApp</label>
                      <input
                        type="tel"
                        value={contactInfo.contact_phone}
                        onChange={(e) => setContactInfo({ ...contactInfo, contact_phone: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-3 border-t border-slate-100">
                  <Button variant="outline" size="md" onClick={() => setBookingStep(1)}>
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    className="bg-[#0B2A6F] text-white"
                    disabled={isBookingSubmitting}
                    onClick={handleProceedToPayment}
                  >
                    Proceed to Payment <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* ----------------- STEP 3: PAYMENT GATEWAY (STEP 28) ----------------- */}
            {bookingStep === 3 && (
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Select Payment Method
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setPaymentMethod('ESEWA')}
                    className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between ${
                      paymentMethod === 'ESEWA'
                        ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                        eSewa
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">eSewa Mobile Wallet</div>
                        <div className="text-[10px] text-slate-500">Instant direct gateway</div>
                      </div>
                    </div>
                    {paymentMethod === 'ESEWA' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  </div>

                  <div
                    onClick={() => setPaymentMethod('KHALTI')}
                    className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between ${
                      paymentMethod === 'KHALTI'
                        ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-600'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-700 text-white font-bold flex items-center justify-center text-xs">
                        Khalti
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">Khalti Digital Wallet</div>
                        <div className="text-[10px] text-slate-500">Instant verification</div>
                      </div>
                    </div>
                    {paymentMethod === 'KHALTI' && <CheckCircle2 className="w-5 h-5 text-purple-600" />}
                  </div>

                  <div
                    onClick={() => setPaymentMethod('CONNECT_IPS')}
                    className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between ${
                      paymentMethod === 'CONNECT_IPS'
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-700 text-white font-bold flex items-center justify-center text-xs">
                        IPS
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">connectIPS / Bank Transfer</div>
                        <div className="text-[10px] text-slate-500">Direct Nepalese Banks</div>
                      </div>
                    </div>
                    {paymentMethod === 'CONNECT_IPS' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                  </div>

                  <div
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between ${
                      paymentMethod === 'CARD'
                        ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-600'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                        💳
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">Visa / MasterCard / SCT</div>
                        <div className="text-[10px] text-slate-500">Domestic &amp; International Cards</div>
                      </div>
                    </div>
                    {paymentMethod === 'CARD' && <CheckCircle2 className="w-5 h-5 text-amber-600" />}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0B2A6F] text-white flex justify-between items-center">
                  <div>
                    <div className="text-xs text-white/70">Total Payable Amount</div>
                    <div className="text-2xl font-black text-amber-300">
                      NPR {getAuthoritativeTotal().toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> 256-Bit SSL Encrypted
                  </div>
                </div>

                <div className="flex justify-between pt-3 border-t border-slate-100">
                  <Button variant="outline" size="md" onClick={() => setBookingStep(2)}>
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    className="bg-[#0B2A6F] hover:bg-[#071b48] text-white"
                    disabled={isBookingSubmitting}
                    onClick={handleConfirmBooking}
                  >
                    {isBookingSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Processing GDS Booking...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Pay NPR {getAuthoritativeTotal().toLocaleString()} &amp; Issue E-Ticket
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* ----------------- STEP 4: CONFIRMED E-TICKET (STEP 29) ----------------- */}
            {bookingStep === 4 && bookingSuccessData && (
              <div className="space-y-5 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-2xl font-extrabold text-[#0B2A6F]">Flight Booking Confirmed!</h4>
                  <p className="text-xs text-slate-600">
                    Your official E-Ticket has been generated in the airline reservation system.
                  </p>
                </div>

                {/* Printable Boarding Pass Card */}
                <div className="p-6 rounded-3xl bg-[#0B2A6F] text-white space-y-4 text-left shadow-xl">
                  <div className="flex justify-between items-center border-b border-white/20 pb-3">
                    <div>
                      <div className="text-[10px] text-white/70 uppercase">Airline Record Locator</div>
                      <div className="text-xl font-black font-mono text-amber-300">
                        {bookingSuccessData.booking?.pnr}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-white/70 uppercase">Status</div>
                      <div className="text-xs font-bold bg-emerald-500 text-white px-2.5 py-0.5 rounded-full inline-block">
                        ISSUED &amp; CONFIRMED
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <div className="text-white/60 text-[10px]">Flight</div>
                      <div className="font-bold">{selectedOffer.flight_number}</div>
                    </div>
                    <div>
                      <div className="text-white/60 text-[10px]">Route</div>
                      <div className="font-bold">{selectedOffer.origin} → {selectedOffer.destination}</div>
                    </div>
                    <div>
                      <div className="text-white/60 text-[10px]">Dep Date</div>
                      <div className="font-bold">{selectedOffer.departure_date}</div>
                    </div>
                    <div>
                      <div className="text-white/60 text-[10px]">Cabin</div>
                      <div className="font-bold">{selectedOffer.cabin_class}</div>
                    </div>
                  </div>

                  {/* Passenger & E-Ticket Numbers */}
                  <div className="space-y-2 pt-3 border-t border-white/20 text-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white/70">Passenger E-Ticket Roster</div>
                    {bookingSuccessData.booking?.tickets?.map((t, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white/10 p-2.5 rounded-xl">
                        <span className="font-semibold">{t.passenger_name} ({t.seat_number})</span>
                        <span className="font-mono font-bold text-amber-300">{t.ticket_number}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 text-center text-xs text-white/60 font-mono">
                    ||||| ||||||| |||| |||||||||| |||||| |||||
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full justify-center"
                    onClick={() => window.print()}
                  >
                    <Download className="w-4 h-4 mr-2" /> Print / Save E-Ticket
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full justify-center bg-[#0B2A6F] text-white"
                    onClick={() => {
                      setIsBookingModalOpen(false);
                      setBookingSuccessData(null);
                    }}
                  >
                    Done &amp; Return to Flights
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= STEP 30: QUICK PNR RETRIEVAL MODAL ================= */}
      {pnrSearchResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-[#0B2A6F]">
                Flight Reservation #{pnrSearchResult.pnr || pnrSearchInput}
              </h3>
              <button onClick={() => setPnrSearchResult(null)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#0B2A6F] text-white space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/70">Status:</span>
                <span className="text-xs font-bold bg-emerald-500 text-white px-2.5 py-0.5 rounded-full">
                  {pnrSearchResult.status || 'CONFIRMED'}
                </span>
              </div>
              <div className="text-sm font-bold">
                {pnrSearchResult.from_location} → {pnrSearchResult.to_location}
              </div>
              <div className="text-xs text-white/80">
                Date: {pnrSearchResult.departure_date} | Class: {pnrSearchResult.travel_class}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="md"
                className="w-1/2 justify-center text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => {
                  setPnrSearchResult(null);
                  handleOpenCancelModal(pnrSearchResult);
                }}
              >
                Cancel Booking
              </Button>
              <Button
                variant="primary"
                size="md"
                className="w-1/2 justify-center bg-[#0B2A6F] text-white"
                onClick={() => setPnrSearchResult(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 31: FLIGHT CANCELLATION MODAL ================= */}
      {cancellationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-900">Cancel Flight Reservation?</h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to cancel this booking? Airline cancellation rules will apply.
              </p>
            </div>

            {cancellationSummary ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2 text-left">
                <div className="font-bold text-emerald-800">Cancellation Successful</div>
                <div>Refund Amount: <strong>NPR {cancellationSummary.refund_amount_npr?.toLocaleString()}</strong></div>
                <div>Cancellation Fee: <strong>NPR {cancellationSummary.cancellation_fee_npr?.toLocaleString()}</strong></div>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full mt-2 justify-center bg-[#0B2A6F] text-white"
                  onClick={() => setCancellationModalOpen(false)}
                >
                  Done
                </Button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-left space-y-1.5">
                <div className="flex justify-between">
                  <span>Standard Cancellation Fee:</span>
                  <span className="font-bold text-red-600">NPR 3,500</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Net Refund:</span>
                  <span className="font-bold text-emerald-600 font-mono">NPR 34,000</span>
                </div>
              </div>
            )}

            {!cancellationSummary && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="md"
                  className="w-1/2 justify-center"
                  onClick={() => setCancellationModalOpen(false)}
                >
                  Keep Booking
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  className="w-1/2 justify-center bg-red-600 hover:bg-red-700 text-white"
                  disabled={isCancelling}
                  onClick={handleExecuteCancellation}
                >
                  {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUCCESS CONFIRMATION MODAL (For Offline Quote) */}
      {isSuccessModalOpen && submittedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                Quote Request Submitted
              </span>
              <h3 className="text-2xl font-extrabold text-[#0B2A6F]">
                Inquiry Received!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Your flight inquiry #{submittedData.referenceId} has been sent to our ticketing team. We will call you with custom quotes.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              className="w-full justify-center"
              onClick={() => { setIsSuccessModalOpen(false); reset(); }}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketRequestPage;
