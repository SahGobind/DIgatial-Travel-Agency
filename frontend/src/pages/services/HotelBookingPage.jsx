import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  MapPin, 
  Star, 
  Calendar, 
  Users, 
  Check, 
  ShieldCheck, 
  CreditCard, 
  ArrowRight, 
  X, 
  CheckCircle2, 
  Filter,
  AlertCircle,
  Loader2
} from 'lucide-react';
import Container from '../../components/common/Container';
import PageHeader from '../../components/common/PageHeader';
import { mockHotels } from '../../data/hotels';
import { hotelService } from '../../services';
import { useAuth } from '../../context/AuthContext';

export const HotelBookingPage = () => {
  const { user, loginAsDemoCustomer, isAuthenticated } = useAuth();
  const [hotels, setHotels] = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(true);
  const [selectedCity, setSelectedCity] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Search filter inputs
  const [checkInDate, setCheckInDate] = useState('2026-10-05');
  const [checkOutDate, setCheckOutDate] = useState('2026-10-09');
  const [guestsCount, setGuestsCount] = useState(2);
  const [roomsCount, setRoomsCount] = useState(1);

  // Selected hotel for booking modal
  const [activeHotel, setActiveHotel] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingFormData, setBookingFormData] = useState({
    fullName: user?.name || 'Sonu Kumar Sah',
    phone: user?.phone || '9812193621',
    email: user?.email || 'sonu.sah@gmail.com',
    specialRequests: 'Non-smoking high floor room requested'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  const [bookingError, setBookingError] = useState('');

  // Fetch hotels from backend
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoadingHotels(true);
        const data = await hotelService.getHotels();
        if (data && data.length > 0) {
          // Normalize backend hotel objects with default roomTypes if needed
          const formatted = data.map((h, idx) => ({
            id: h.id,
            name: h.name,
            city: h.location?.split(',')[0] || h.city || 'Dubai',
            country: h.country || 'UAE',
            stars: 4,
            rating: parseFloat(h.rating) || 4.8,
            reviewsCount: 120 + idx * 15,
            pricePerNight: parseFloat(h.price_per_night) || 8500,
            image: h.image || (mockHotels[idx % mockHotels.length]?.image) || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
            description: h.description || 'Premium modern accommodation with luxury amenities and 24/7 guest support.',
            category: h.country === 'Nepal' ? 'Pilgrimage' : (h.country === 'UAE' ? 'Middle East' : 'Asia'),
            tags: ['Free Wifi', 'Airport Pickup', 'Instant Confirmation'],
            amenities: h.amenities ? (typeof h.amenities === 'string' ? h.amenities.split(',') : h.amenities) : ['Free High Speed WiFi', 'Swimming Pool', 'Breakfast Included', 'Fitness Center'],
            roomTypes: [
              { name: 'Deluxe City View Room', capacity: '2 Adults, 1 Child', price: parseFloat(h.price_per_night) || 8500 },
              { name: 'Executive Suite', capacity: '3 Adults', price: Math.round((parseFloat(h.price_per_night) || 8500) * 1.5) }
            ]
          }));
          setHotels(formatted);
        } else {
          setHotels(mockHotels);
        }
      } catch (err) {
        console.warn('Backend hotels fetch fallback:', err.message);
        setHotels(mockHotels);
      } finally {
        setLoadingHotels(false);
      }
    };

    fetchHotels();
  }, []);

  // Update form defaults when user context becomes available
  useEffect(() => {
    if (user) {
      setBookingFormData((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        phone: user.phone || prev.phone,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  // Filtering
  const filteredHotels = hotels.filter((hotel) => {
    const matchesCity = selectedCity === 'All' || hotel.city.toLowerCase() === selectedCity.toLowerCase();
    const matchesCategory = selectedCategory === 'All' || hotel.category === selectedCategory;
    const matchesQuery = 
      hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.country.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesCategory && matchesQuery;
  });

  const calculateNights = () => {
    const d1 = new Date(checkInDate);
    const d2 = new Date(checkOutDate);
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = calculateNights();

  const handleOpenBooking = (hotel) => {
    setActiveHotel(hotel);
    setSelectedRoom(hotel.roomTypes?.[0] || { name: 'Deluxe Room', price: hotel.pricePerNight, capacity: '2 Adults' });
    setBookingError('');
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setBookingError('');

    try {
      if (!isAuthenticated) {
        try {
          await loginAsDemoCustomer();
        } catch (authErr) {
          // continue
        }
      }

      const totalCalculated = selectedRoom.price * nights * roomsCount;
      const bookingPayload = {
        hotel_id: activeHotel.id,
        check_in: checkInDate,
        check_out: checkOutDate,
        guests: guestsCount,
        rooms: roomsCount,
        special_requests: bookingFormData.specialRequests,
        total_amount: totalCalculated,
      };

      const response = await hotelService.createBooking(bookingPayload);

      const confirmation = {
        bookingRef: `HTL-${response.id || Math.floor(100000 + Math.random() * 900000)}`,
        hotelName: activeHotel.name,
        city: activeHotel.city,
        roomType: selectedRoom.name,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights: nights,
        rooms: roomsCount,
        guests: guestsCount,
        customerName: bookingFormData.fullName,
        phone: bookingFormData.phone,
        totalAmount: totalCalculated,
        status: response.status || 'Confirmed'
      };

      setBookingConfirmation(confirmation);
      setActiveHotel(null);
    } catch (err) {
      setBookingError(err.customMessage || err.message || 'Failed to complete hotel booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      <PageHeader
        badge="Hotel Booking & Accommodations"
        title="Find & Book Luxury & Budget Hotels"
        subtitle="Guaranteed room reservations in Dubai, Doha, Kuala Lumpur, Kathmandu, Janakpur Dham and worldwide with instant vouchers."
        breadcrumbs={[
          { label: 'Home', link: '/' },
          { label: 'Services', link: '/services' },
          { label: 'Hotels' }
        ]}
      />

      <Container className="mt-8">
        {/* Modern Search Engine Bar */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md mb-10 -mt-12 relative z-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* 1. Destination Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#D71920]" /> Destination / City
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#0B2A6F]"
              >
                <option value="All">All Global Cities</option>
                <option value="Dubai">Dubai, UAE</option>
                <option value="Doha">Doha, Qatar</option>
                <option value="Kuala Lumpur">Kuala Lumpur, Malaysia</option>
                <option value="Janakpur Dham">Janakpur Dham, Nepal</option>
                <option value="Kathmandu">Kathmandu, Nepal</option>
                <option value="Bangkok">Bangkok, Thailand</option>
              </select>
            </div>

            {/* 2. Check-in & Check-out */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#0B2A6F]" /> Check-In
                </label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0B2A6F]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#0B2A6F]" /> Check-Out
                </label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0B2A6F]"
                />
              </div>
            </div>

            {/* 3. Guests & Rooms */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#0B2A6F]" /> Guests
                </label>
                <select
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0B2A6F]"
                >
                  <option value={1}>1 Adult</option>
                  <option value={2}>2 Adults</option>
                  <option value={3}>3 Adults</option>
                  <option value={4}>4+ Family</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-[#0B2A6F]" /> Rooms
                </label>
                <select
                  value={roomsCount}
                  onChange={(e) => setRoomsCount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0B2A6F]"
                >
                  <option value={1}>1 Room</option>
                  <option value={2}>2 Rooms</option>
                  <option value={3}>3 Rooms</option>
                </select>
              </div>
            </div>

            {/* 4. Search Input */}
            <div>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Hotel name or landmark..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0B2A6F]"
                />
              </div>
            </div>
          </div>

          {/* Quick Category Filter Pills */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Category:
              </span>
              {['All', 'Middle East', 'Asia', 'Pilgrimage', 'Luxury'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#0B2A6F] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="text-xs font-medium text-slate-500">
              Showing <strong className="text-slate-800">{filteredHotels.length}</strong> verified accommodations ({nights} {nights === 1 ? 'Night' : 'Nights'})
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loadingHotels ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#0B2A6F] mb-3" />
            <p className="text-sm font-semibold">Loading verified hotels from database...</p>
          </div>
        ) : (
          /* Hotel Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredHotels.map((hotel) => (
              <div
                key={hotel.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Image & Badges */}
                <div className="relative h-60 overflow-hidden">
                  <img
                    src={hotel.image}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-[#0B2A6F] flex items-center gap-1 shadow-md">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{hotel.rating}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({hotel.reviewsCount})</span>
                  </div>

                  {/* Stars Indicator */}
                  <div className="absolute top-3 left-3 bg-slate-900/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-amber-300 flex items-center gap-0.5">
                    {[...Array(hotel.stars || 4)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-300" />
                    ))}
                    <span className="ml-1 text-white text-[10px]">Hotel</span>
                  </div>

                  {/* Location & Title */}
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <span className="text-[11px] font-semibold text-blue-200 flex items-center gap-1 mb-0.5">
                      <MapPin className="w-3 h-3 text-[#D71920]" /> {hotel.city}, {hotel.country}
                    </span>
                    <h3 className="text-xl font-bold leading-snug">{hotel.name}</h3>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                      {hotel.description}
                    </p>

                    {/* Highlights / Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {(hotel.tags || ['Free Wifi', 'Best Price']).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0B2A6F] text-[10px] font-bold border border-blue-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Amenities */}
                    <div className="space-y-1 text-xs text-slate-500">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Key Amenities:</span>
                      <div className="grid grid-cols-2 gap-1 text-[11px]">
                        {(hotel.amenities || []).slice(0, 4).map((amenity, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-slate-700">
                            <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Price and Action Bar */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Starting from / night</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-black text-[#0B2A6F]">
                          NPR {hotel.pricePerNight?.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenBooking(hotel)}
                      className="px-4 py-2 bg-[#D71920] hover:bg-[#b01319] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      Reserve <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Agency Hospitality Guarantee Banner */}
        <div className="mt-16 bg-gradient-to-r from-[#0B2A6F] via-[#123D8D] to-[#0B2A6F] rounded-3xl p-8 sm:p-10 text-white shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left items-center">
            <div className="md:col-span-2 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-blue-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Digital World Guarantee
              </span>
              <h3 className="text-2xl font-black">Official Hotel Vouchers with 24/7 Check-in Support</h3>
              <p className="text-xs text-blue-100/90 max-w-xl">
                Avoid booking surprises. Every reservation through our Janakpur Dham travel desk is confirmed directly with hotel management with complimentary airport pickup assistance available upon request.
              </p>
            </div>

            <div className="text-center md:text-right">
              <span className="text-xs text-blue-200 block mb-1">Direct Hotel Desk Hotlines</span>
              <div className="text-xl font-bold font-mono text-emerald-300">9702022094 / 9812193621</div>
              <span className="text-[11px] text-blue-200 block mt-1">Available 7 Days a Week</span>
            </div>
          </div>
        </div>
      </Container>

      {/* Reservation Request Modal */}
      {activeHotel && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setActiveHotel(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4 mb-6">
              <img
                src={activeHotel.image}
                alt={activeHotel.name}
                className="w-24 h-20 rounded-2xl object-cover border border-slate-200 shrink-0"
              />
              <div>
                <span className="text-[11px] font-bold text-[#D71920] uppercase tracking-wider">{activeHotel.city}, {activeHotel.country}</span>
                <h3 className="text-xl font-extrabold text-[#0B2A6F]">{activeHotel.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{activeHotel.city}, {activeHotel.country}</p>
              </div>
            </div>

            {bookingError && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmBooking} className="space-y-6">
              {/* Room Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select Room Category</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(activeHotel.roomTypes || []).map((room, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedRoom(room)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        selectedRoom.name === room.name
                          ? 'border-[#0B2A6F] bg-blue-50/60 ring-2 ring-[#0B2A6F]/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-slate-900">{room.name}</span>
                        {selectedRoom.name === room.name && <CheckCircle2 className="w-4 h-4 text-[#0B2A6F]" />}
                      </div>
                      <span className="text-[11px] text-slate-500 block">{room.capacity}</span>
                      <span className="text-xs font-black text-[#0B2A6F] mt-1 block">NPR {room.price?.toLocaleString()} / night</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stay Summary */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Check-In</span>
                  <span className="font-bold text-slate-800">{checkInDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Duration</span>
                  <span className="font-bold text-[#0B2A6F]">{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Check-Out</span>
                  <span className="font-bold text-slate-800">{checkOutDate}</span>
                </div>
              </div>

              {/* Guest Details */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Primary Guest Information</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Full Name (as in Passport)</label>
                    <input
                      type="text"
                      value={bookingFormData.fullName}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, fullName: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0B2A6F]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={bookingFormData.phone}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, phone: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0B2A6F]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Special Inquiries / Arrival Time</label>
                  <input
                    type="text"
                    value={bookingFormData.specialRequests}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, specialRequests: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0B2A6F]"
                  />
                </div>
              </div>

              {/* Price Calculation */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">Total Calculated Stay:</span>
                  <span className="text-xl font-black text-[#0B2A6F]">
                    NPR {(selectedRoom.price * nights * roomsCount).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block">Includes all local hotel taxes & service charges</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-[#D71920] hover:bg-[#b01319] text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Securing Room...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Confirm Reservation
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Voucher Dialog */}
      {bookingConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-scale-up">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="text-center mb-6">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full uppercase tracking-wider">
                Reservation Confirmed
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">Hotel Voucher Generated!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your reservation at <strong className="text-slate-800">{bookingConfirmation.hotelName}</strong> has been secured in the database.
              </p>
            </div>

            {/* Voucher Box */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Booking Reference:</span>
                <span className="font-bold font-mono text-[#0B2A6F]">{bookingConfirmation.bookingRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Primary Guest:</span>
                <span className="font-semibold text-slate-900">{bookingConfirmation.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Room Type:</span>
                <span className="font-semibold text-slate-700">{bookingConfirmation.roomType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Stay Duration:</span>
                <span className="font-semibold text-slate-900">{bookingConfirmation.checkIn} to {bookingConfirmation.checkOut} ({bookingConfirmation.nights} Nights)</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-black">
                <span className="text-slate-800">Total Billed:</span>
                <span className="text-[#0B2A6F]">NPR {bookingConfirmation.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => window.print()}
                className="w-full py-2.5 bg-[#0B2A6F] hover:bg-[#123D8D] text-white text-xs font-bold rounded-xl text-center shadow-xs transition-colors cursor-pointer"
              >
                Print Voucher
              </button>
              <button
                onClick={() => setBookingConfirmation(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelBookingPage;
