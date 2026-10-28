import React, { useState, useEffect } from 'react';
import { 
  Bus, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  Printer, 
  Sparkles, 
  Car, 
  Compass, 
  Phone, 
  ArrowRight, 
  ChevronRight,
  Search,
  Filter,
  Check,
  X,
  CreditCard,
  Banknote,
  Navigation,
  Fuel,
  Info
} from 'lucide-react';
import Container from '../../components/common/Container';
import PageHeader from '../../components/common/PageHeader';
import SectionTitle from '../../components/common/SectionTitle';
import Button from '../../components/common/Button';
import transportService from '../../services/transportService';

export const RoadTransportBookingPage = () => {
  // Tomorrow's date formatted as YYYY-MM-DD
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  // Search & Filter State
  const [fromCity, setFromCity] = useState('Kathmandu');
  const [toCity, setToCity] = useState('Pokhara');
  const [travelDate, setTravelDate] = useState(defaultDate);
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('ALL');
  const [shiftFilter, setShiftFilter] = useState('ALL');

  // Data & Results
  const [schedules, setSchedules] = useState([]);
  const [routesMeta, setRoutesMeta] = useState({ from_cities: [], to_cities: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Booking Flow State
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [boardingPoint, setBoardingPoint] = useState('');
  const [droppingPoint, setDroppingPoint] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('PAY_ON_BOARDING');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  // Confirmation Success Voucher
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // Load Initial Nepal Routes & Cities
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const data = await transportService.getRoutes();
        if (data) {
          setRoutesMeta({
            from_cities: data.from_cities || ['Kathmandu', 'Pokhara', 'Janakpur', 'Chitwan', 'Lumbini'],
            to_cities: data.to_cities || ['Pokhara', 'Kathmandu', 'Janakpur', 'Chitwan', 'Lumbini', 'Muktinath', 'Salleri', 'Kalinchowk']
          });
        }
      } catch (err) {
        console.warn('Could not load routes meta, using defaults', err);
      }
    };
    loadRoutes();
    handleSearch();
  }, []);

  // Search API Call
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const results = await transportService.searchTransports({
        from_city: fromCity,
        to_city: toCity,
        vehicle_type: vehicleTypeFilter,
        shift: shiftFilter,
        date: travelDate,
      });
      setSchedules(results || []);
    } catch (err) {
      console.error('Search error:', err);
      setError('Unable to fetch roadway transport departures. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Open Booking Drawer / Modal
  const openBookingModal = (schedule) => {
    setSelectedSchedule(schedule);
    setSelectedSeats([]);
    setBookingError(null);

    // Default to first boarding & dropping stop
    const bPoints = schedule.route?.boarding_points || [];
    const dPoints = schedule.route?.dropping_points || [];
    setBoardingPoint(bPoints.length > 0 ? (bPoints[0].stop || bPoints[0]) : `${schedule.route?.from_city} Main Bus Stand`);
    setDroppingPoint(dPoints.length > 0 ? (dPoints[dPoints.length - 1].stop || dPoints[dPoints.length - 1]) : `${schedule.route?.to_city} Tourist Park`);

    setBookingModalOpen(true);
  };

  // Toggle Seat Selection
  const toggleSeat = (seatId) => {
    if (!selectedSchedule) return;
    const occupied = selectedSchedule.occupied_seats || [];
    if (occupied.includes(seatId)) return; // cannot pick already booked seat

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  // Calculate live amount
  const calculateTotalFare = () => {
    if (!selectedSchedule) return 0;
    const fare = parseFloat(selectedSchedule.fare_npr) || 0;
    if (selectedSchedule.pricing_type === 'WHOLE_VEHICLE') {
      return fare;
    }
    const count = selectedSeats.length || 1;
    return fare * count;
  };

  // Submit Booking to Backend & Save to Database
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedSchedule) return;

    if (!passengerName.trim()) {
      setBookingError('Please enter the passenger lead name.');
      return;
    }
    if (!passengerPhone.trim() || passengerPhone.length < 8) {
      setBookingError('Please enter a valid Nepali contact mobile number (e.g. 98XXXXXXXX).');
      return;
    }

    if (selectedSchedule.pricing_type !== 'WHOLE_VEHICLE' && selectedSeats.length === 0) {
      setBookingError('Please select at least one seat from the interactive seat map.');
      return;
    }

    setBookingSubmitting(true);
    setBookingError(null);

    try {
      const payload = {
        schedule_id: selectedSchedule.id,
        travel_date: travelDate,
        passenger_name: passengerName,
        passenger_phone: passengerPhone,
        passenger_email: passengerEmail,
        selected_seats: selectedSchedule.pricing_type === 'WHOLE_VEHICLE' ? ['Full Vehicle'] : selectedSeats,
        seat_count: selectedSchedule.pricing_type === 'WHOLE_VEHICLE' ? 1 : selectedSeats.length,
        boarding_point: boardingPoint,
        dropping_point: droppingPoint,
        special_notes: specialNotes,
        payment_status: paymentStatus,
      };

      const res = await transportService.createBooking(payload);
      setConfirmedBooking(res);
      setBookingModalOpen(false);
      setSuccessModalOpen(true);
      // Refresh list to update occupied seats
      handleSearch();
    } catch (err) {
      console.error('Booking submission failed:', err);
      const serverMsg = err.response?.data?.message || err.response?.data?.errors?.selected_seats?.[0] || 'Booking failed. Please verify your details.';
      setBookingError(serverMsg);
    } finally {
      setBookingSubmitting(false);
    }
  };

  // Generate Bus Seat Grid Layout
  const renderSeatMap = (schedule) => {
    const total = schedule.vehicle?.total_seats || 30;
    const layout = schedule.vehicle?.seat_layout || '2x2_DELUXE';
    const occupied = schedule.occupied_seats || [];

    // VIP Sofa 2x1 (Left 2, Right 1)
    if (layout === '2x1_SOFA') {
      const rows = Math.ceil(total / 3);
      return (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-200 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5"><Navigation className="w-3.5 h-3.5 text-[#0B2A6F]" /> Front Driver Cabin</span>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-[#0B2A6F] font-bold">2x1 VIP Sofa Bus</span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-2">
            {Array.from({ length: rows }).map((_, rIdx) => {
              const rowNum = rIdx + 1;
              const seatA = `A${rowNum}`;
              const seatB = `B${rowNum}`;
              const seatC = `C${rowNum}`;

              return (
                <div key={rowNum} className="flex items-center justify-between gap-4">
                  {/* Left Column (2 Seats) */}
                  <div className="flex gap-2">
                    {[seatA, seatB].map(seatId => {
                      const isOccupied = occupied.includes(seatId);
                      const isSelected = selectedSeats.includes(seatId);
                      return (
                        <button
                          key={seatId}
                          type="button"
                          disabled={isOccupied}
                          onClick={() => toggleSeat(seatId)}
                          className={`w-10 h-10 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center border shadow-xs ${
                            isOccupied
                              ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                              : isSelected
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md scale-105 ring-2 ring-emerald-300'
                              : 'bg-white text-slate-700 border-slate-300 hover:border-[#0B2A6F] hover:bg-blue-50/50'
                          }`}
                        >
                          {isOccupied ? <X className="w-3.5 h-3.5 text-slate-400" /> : seatId}
                        </button>
                      );
                    })}
                  </div>

                  {/* Aisle */}
                  <span className="text-[10px] uppercase font-bold text-slate-300 select-none">Aisle</span>

                  {/* Right Column (1 VIP Sofa Seat) */}
                  <div>
                    <button
                      type="button"
                      disabled={occupied.includes(seatC)}
                      onClick={() => toggleSeat(seatC)}
                      className={`w-11 h-10 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center border shadow-xs ${
                        occupied.includes(seatC)
                          ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                          : selectedSeats.includes(seatC)
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-md scale-105 ring-2 ring-emerald-300'
                          : 'bg-amber-50/60 text-slate-800 border-amber-300 hover:border-amber-500 hover:bg-amber-100/50'
                      }`}
                    >
                      {occupied.includes(seatC) ? <X className="w-3.5 h-3.5 text-slate-400" /> : seatC}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Standard 2x2 Deluxe Bus or HiAce
    const rows = Math.ceil(total / 4);
    return (
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-200 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1.5"><Navigation className="w-3.5 h-3.5 text-[#0B2A6F]" /> Cabin Entrance</span>
          <span className="text-slate-400">Total: {total} Seats</span>
        </div>

        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-2">
          {Array.from({ length: rows }).map((_, rIdx) => {
            const rowNum = rIdx + 1;
            const seatA = `A${rowNum}`;
            const seatB = `B${rowNum}`;
            const seatC = `C${rowNum}`;
            const seatD = `D${rowNum}`;

            return (
              <div key={rowNum} className="flex items-center justify-between gap-3">
                {/* Left 2 */}
                <div className="flex gap-2">
                  {[seatA, seatB].map(seatId => {
                    const isOccupied = occupied.includes(seatId);
                    const isSelected = selectedSeats.includes(seatId);
                    return (
                      <button
                        key={seatId}
                        type="button"
                        disabled={isOccupied}
                        onClick={() => toggleSeat(seatId)}
                        className={`w-10 h-10 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center border shadow-xs ${
                          isOccupied
                            ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                            : isSelected
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md scale-105 ring-2 ring-emerald-300'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-[#0B2A6F] hover:bg-blue-50/50'
                        }`}
                      >
                        {isOccupied ? <X className="w-3.5 h-3.5 text-slate-400" /> : seatId}
                      </button>
                    );
                  })}
                </div>

                <span className="text-[10px] uppercase font-bold text-slate-300 select-none">Aisle</span>

                {/* Right 2 */}
                <div className="flex gap-2">
                  {[seatC, seatD].map(seatId => {
                    const isOccupied = occupied.includes(seatId);
                    const isSelected = selectedSeats.includes(seatId);
                    return (
                      <button
                        key={seatId}
                        type="button"
                        disabled={isOccupied}
                        onClick={() => toggleSeat(seatId)}
                        className={`w-10 h-10 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center border shadow-xs ${
                          isOccupied
                            ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                            : isSelected
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md scale-105 ring-2 ring-emerald-300'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-[#0B2A6F] hover:bg-blue-50/50'
                        }`}
                      >
                        {isOccupied ? <X className="w-3.5 h-3.5 text-slate-400" /> : seatId}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full pb-20 bg-slate-50 min-h-screen">
      {/* 1. PAGE HEADER */}
      <PageHeader
        badge="Nepal Roadways & Fleet"
        title="Nepal Roadway Transportation Booking"
        subtitle="Reserve Tourist Buses, Highway HiAce Microbuses, 4WD Mountain Jeeps, and Intercity EV Cabs across Nepal."
        breadcrumbs={[
          { label: 'Services', link: '/services' },
          { label: 'Nepal Road Transport' },
        ]}
      />

      {/* 2. SEARCH & FILTER SECTION */}
      <section className="-mt-8 relative z-20">
        <Container>
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
            <form onSubmit={handleSearch} className="space-y-6">
              {/* Origin, Destination, Date & Shift */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* From City */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#D71920]" />
                    Origin (From Hub)
                  </label>
                  <select
                    value={fromCity}
                    onChange={(e) => setFromCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2A6F]"
                  >
                    <option value="All">All Nepal Cities</option>
                    {(routesMeta.from_cities.length > 0 ? routesMeta.from_cities : ['Kathmandu', 'Pokhara', 'Janakpur', 'Chitwan', 'Lumbini', 'Besisahar']).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* To City */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-[#0B2A6F]" />
                    Destination (To Hub)
                  </label>
                  <select
                    value={toCity}
                    onChange={(e) => setToCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2A6F]"
                  >
                    <option value="All">All Nepal Destinations</option>
                    {(routesMeta.to_cities.length > 0 ? routesMeta.to_cities : ['Pokhara', 'Kathmandu', 'Janakpur', 'Chitwan', 'Lumbini', 'Muktinath', 'Salleri', 'Kalinchowk', 'Birgunj', 'Dharan']).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Travel Date */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    Travel Date
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2A6F]"
                  />
                </div>

                {/* Search Button */}
                <div className="flex items-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    icon={Search}
                    disabled={loading}
                    className="w-full justify-center shadow-lg shadow-blue-900/20"
                  >
                    {loading ? 'Searching Fleets...' : 'Find Nepal Transports'}
                  </Button>
                </div>
              </div>

              {/* Vehicle Category Pills */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Vehicle Type:
                </span>
                {[
                  { id: 'ALL', label: 'All Fleet Types' },
                  { id: 'TOURIST_BUS', label: 'VIP Sofa / Tourist Bus' },
                  { id: 'MICRO_BUS', label: 'Express HiAce Micro' },
                  { id: 'JEEP_4X4', label: '4WD Mountain Jeep' },
                  { id: 'PRIVATE_CAR', label: 'Private Car / EV Cab' },
                  { id: 'NIGHT_COACH', label: 'Night Deluxe Coach' },
                ].map((vt) => (
                  <button
                    key={vt.id}
                    type="button"
                    onClick={() => {
                      setVehicleTypeFilter(vt.id);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                      vehicleTypeFilter === vt.id
                        ? 'bg-[#0B2A6F] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {vt.label}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </Container>
      </section>

      {/* 3. SEARCH RESULTS & AVAILABLE DEPARTURES */}
      <section className="py-12">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-black text-[#0B2A6F]">
                Available Departures ({schedules.length})
              </h2>
              <p className="text-sm text-slate-500 font-medium">
                Route: <span className="font-bold text-slate-800">{fromCity} ➔ {toCity}</span> on <span className="font-bold text-slate-800">{travelDate}</span>
              </p>
            </div>

            {/* Quick Shift Filter */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold">
              <span className="text-slate-400">Shift:</span>
              {['ALL', 'MORNING', 'NIGHT'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setShiftFilter(s)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    shiftFilter === s ? 'bg-blue-50 text-[#0B2A6F] font-black' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s === 'ALL' ? 'All' : s === 'MORNING' ? 'Day / Morning' : 'Night'}
                </button>
              ))}
            </div>
          </div>

          {/* Results List */}
          {loading ? (
            <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-200">
              <div className="w-12 h-12 border-4 border-[#0B2A6F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-base font-bold text-slate-700">Checking verified Nepal roadway schedules...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 rounded-3xl p-8 border border-red-200 text-center">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="font-bold">{error}</p>
            </div>
          ) : schedules.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
              <Bus className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-2">No Scheduled Departures Found</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                Try selecting "All Nepal Cities" or choose popular highway corridors like Kathmandu ➔ Pokhara, Janakpur, or Chitwan.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFromCity('Kathmandu');
                  setToCity('Pokhara');
                  setVehicleTypeFilter('ALL');
                }}
                className="px-5 py-2.5 bg-[#0B2A6F] text-white rounded-xl text-xs font-bold hover:bg-[#123D8D]"
              >
                Reset to Kathmandu ➔ Pokhara
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {schedules.map((schedule) => {
                const vehicle = schedule.vehicle || {};
                const route = schedule.route || {};
                const availableSeats = schedule.available_seats_count ?? (vehicle.total_seats - (schedule.occupied_seats?.length || 0));

                return (
                  <div
                    key={schedule.id}
                    className="bg-white rounded-3xl border border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-6 sm:p-8 flex flex-col lg:flex-row items-stretch justify-between gap-6">
                      {/* Vehicle Image & Basic Info */}
                      <div className="flex flex-col sm:flex-row gap-5 items-start lg:w-2/5">
                        <img
                          src={vehicle.image_url || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400&q=80'}
                          alt={vehicle.name}
                          className="w-full sm:w-36 h-28 object-cover rounded-2xl border border-slate-100 shrink-0 shadow-xs"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-blue-100 text-[#0B2A6F]">
                              {vehicle.vehicle_type_display || vehicle.vehicle_type}
                            </span>
                            <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                              ★ {vehicle.rating || '4.8'}
                            </span>
                          </div>

                          <h3 className="text-lg font-extrabold text-[#0B2A6F] leading-snug truncate">
                            {vehicle.name}
                          </h3>
                          <p className="text-xs font-semibold text-slate-500 mb-2">
                            Operated by {vehicle.operator_name}
                          </p>

                          {/* Amenities Badges */}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {(vehicle.amenities || []).slice(0, 4).map((amenity, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-semibold text-slate-600"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Journey Timing & Highway Route */}
                      <div className="lg:w-1/3 flex flex-col justify-center border-y sm:border-y-0 sm:border-x border-slate-100 py-4 sm:py-0 sm:px-6">
                        <div className="flex items-center justify-between text-slate-800 mb-2">
                          <div>
                            <span className="text-xl font-black text-slate-900">
                              {schedule.departure_time?.slice(0, 5) || '07:00'}
                            </span>
                            <p className="text-xs font-bold text-slate-500 uppercase">{route.from_city}</p>
                          </div>

                          <div className="flex flex-col items-center px-4">
                            <span className="text-[11px] font-bold text-slate-400 mb-1">{route.estimated_duration || '6-7 Hrs'}</span>
                            <div className="w-24 h-0.5 bg-slate-200 relative flex items-center justify-center">
                              <Bus className="w-3.5 h-3.5 text-[#D71920] absolute bg-white px-0.5" />
                            </div>
                            <span className="text-[10px] text-slate-400 mt-1">{route.highway_name || 'Highway'}</span>
                          </div>

                          <div className="text-right">
                            <span className="text-xl font-black text-slate-900">
                              {schedule.arrival_time?.slice(0, 5) || '14:00'}
                            </span>
                            <p className="text-xs font-bold text-slate-500 uppercase">{route.to_city}</p>
                          </div>
                        </div>

                        <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-xl mt-2 flex items-center gap-1.5">
                          <Navigation className="w-3.5 h-3.5 text-[#0B2A6F] shrink-0" />
                          <span className="truncate">
                            Boarding: {(route.boarding_points?.[0]?.stop || route.boarding_points?.[0] || 'Designated Terminal')}
                          </span>
                        </div>
                      </div>

                      {/* Pricing & Booking CTA */}
                      <div className="lg:w-1/4 flex flex-col justify-between items-end gap-3">
                        <div className="text-right w-full">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ticket Fare</span>
                          <div className="text-2xl sm:text-3xl font-black text-[#0B2A6F]">
                            NPR {parseFloat(schedule.fare_npr).toLocaleString()}
                          </div>
                          <p className="text-xs text-slate-500 font-medium">
                            {schedule.pricing_type === 'WHOLE_VEHICLE' ? 'Entire Vehicle Private Hire' : 'Per Seat / Passenger'}
                          </p>

                          {schedule.pricing_type !== 'WHOLE_VEHICLE' && (
                            <div className="mt-1 text-xs font-bold text-emerald-600 flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{availableSeats} Seats Available</span>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => openBookingModal(schedule)}
                          className="w-full py-3 px-5 rounded-2xl bg-[#D71920] hover:bg-[#b5141a] text-white font-extrabold text-sm shadow-md shadow-red-700/20 transition-all flex items-center justify-center gap-2 group"
                        >
                          <span>{schedule.pricing_type === 'WHOLE_VEHICLE' ? 'Book Private Vehicle' : 'Select Seat & Book'}</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Container>
      </section>

      {/* 4. INTERACTIVE SEAT SELECTION & PASSENGER BOOKING DRAWER/MODAL */}
      {bookingModalOpen && selectedSchedule && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase bg-blue-100 text-[#0B2A6F]">
                  Roadway Transport Reservation
                </span>
                <h3 className="text-xl font-black text-[#0B2A6F] mt-1">
                  {selectedSchedule.vehicle?.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedSchedule.route?.from_city} ➔ {selectedSchedule.route?.to_city} on {travelDate} ({selectedSchedule.departure_time?.slice(0, 5)})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBookingModalOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleConfirmBooking} className="p-6 space-y-6">
              {bookingError && (
                <div className="p-4 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{bookingError}</span>
                </div>
              )}

              {/* Seat Selection Map (for seat-based vehicles) */}
              {selectedSchedule.pricing_type !== 'WHOLE_VEHICLE' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-extrabold text-[#0B2A6F] flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#D71920]" />
                      Select Your Preferred Seats
                    </label>
                    <div className="flex items-center gap-3 text-xs font-bold">
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-white border border-slate-300"></span> Available</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-600"></span> Selected</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-300"></span> Booked</span>
                    </div>
                  </div>

                  {renderSeatMap(selectedSchedule)}

                  <div className="mt-3 flex items-center justify-between text-xs font-bold bg-blue-50/70 p-3 rounded-xl border border-blue-100">
                    <span className="text-[#0B2A6F]">Selected Seats:</span>
                    <span className="text-emerald-700 text-sm font-black">
                      {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected yet'}
                    </span>
                  </div>
                </div>
              )}

              {/* Passenger Contact Form */}
              <div className="space-y-4 pt-2">
                <h4 className="text-sm font-extrabold text-[#0B2A6F] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Passenger & Boarding Details (Nepal Verification)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                      Lead Passenger Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar Shrestha"
                      value={passengerName}
                      onChange={(e) => setPassengerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2A6F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                      Nepali Mobile Number *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">+977</span>
                      <input
                        type="tel"
                        required
                        placeholder="98XXXXXXXX"
                        value={passengerPhone}
                        onChange={(e) => setPassengerPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-13 pr-4 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2A6F]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                      Email Address (For E-Ticket Copy)
                    </label>
                    <input
                      type="email"
                      placeholder="passenger@example.com"
                      value={passengerEmail}
                      onChange={(e) => setPassengerEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2A6F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                      Boarding Pickup Point *
                    </label>
                    <select
                      value={boardingPoint}
                      onChange={(e) => setBoardingPoint(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2A6F]"
                    >
                      {(selectedSchedule.route?.boarding_points || []).map((bp, idx) => {
                        const stopName = bp.stop || bp;
                        const time = bp.time ? ` (${bp.time})` : '';
                        return <option key={idx} value={stopName}>{stopName}{time}</option>;
                      })}
                      <option value={`${selectedSchedule.route?.from_city} Main Highway Counter`}>
                        {selectedSchedule.route?.from_city} Main Highway Counter
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                      Dropping Destination Stop *
                    </label>
                    <select
                      value={droppingPoint}
                      onChange={(e) => setDroppingPoint(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2A6F]"
                    >
                      {(selectedSchedule.route?.dropping_points || []).map((dp, idx) => {
                        const stopName = dp.stop || dp;
                        return <option key={idx} value={stopName}>{stopName}</option>;
                      })}
                      <option value={`${selectedSchedule.route?.to_city} Tourist Bus Park`}>
                        {selectedSchedule.route?.to_city} Tourist Bus Park
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                      Payment Mode
                    </label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2A6F]"
                    >
                      <option value="PAY_ON_BOARDING">Pay on Boarding / Bus Counter (NPR Cash/eSewa)</option>
                      <option value="PAID">Prepaid Digital Voucher (Direct Confirmation)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Special Requests / Luggage Note
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2 trekking backpacks, travelling with elderly family member"
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2A6F]"
                  />
                </div>
              </div>

              {/* Price Calculation & Confirmation Action */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Total Payable Amount</span>
                  <div className="text-3xl font-black text-[#0B2A6F]">
                    NPR {calculateTotalFare().toLocaleString()}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Includes road toll, passenger insurance & digital ticket voucher
                  </p>
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={() => setBookingModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="danger"
                    size="lg"
                    disabled={bookingSubmitting}
                    className="shadow-lg shadow-red-700/20 px-8"
                  >
                    {bookingSubmitting ? 'Confirming...' : 'Confirm Ticket Reservation'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. SUCCESS CONFIRMATION MODAL & PRINTABLE E-TICKET VOUCHER */}
      {successModalOpen && confirmedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden print:p-0 print:border-none">
            {/* Header Voucher Banner */}
            <div className="bg-[#0B2A6F] text-white p-6 sm:p-8 text-center relative">
              <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-900/40">
                <Check className="w-8 h-8 text-white stroke-[3]" />
              </div>
              <h3 className="text-2xl font-black">Roadway Ticket Confirmed!</h3>
              <p className="text-blue-100 text-xs font-semibold mt-1">
                Digital World Tour & Travels - Official Nepal Transport Voucher
              </p>

              <div className="mt-4 inline-block bg-white/10 px-4 py-1.5 rounded-full border border-white/20">
                <span className="text-xs font-extrabold uppercase tracking-widest text-amber-300">
                  Ref: {confirmedBooking.booking_reference}
                </span>
              </div>
            </div>

            {/* Voucher Details Table */}
            <div className="p-6 sm:p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 uppercase font-bold block mb-1">Passenger Name</span>
                  <span className="font-extrabold text-slate-900 text-sm">{confirmedBooking.passenger_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-bold block mb-1">Contact Mobile</span>
                  <span className="font-extrabold text-slate-900 text-sm">+977 {confirmedBooking.passenger_phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-bold block mb-1">Route & Highway</span>
                  <span className="font-extrabold text-[#0B2A6F]">
                    {confirmedBooking.schedule?.route?.from_city} ➔ {confirmedBooking.schedule?.route?.to_city}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-bold block mb-1">Travel Date</span>
                  <span className="font-extrabold text-slate-900">{confirmedBooking.travel_date}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-bold block mb-1">Vehicle & Fleet</span>
                  <span className="font-bold text-slate-800">{confirmedBooking.schedule?.vehicle?.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-bold block mb-1">Selected Seats</span>
                  <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {(confirmedBooking.selected_seats || []).join(', ')}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 uppercase font-bold block mb-1">Boarding Stop</span>
                  <span className="font-bold text-slate-800">{confirmedBooking.boarding_point}</span>
                </div>
              </div>

              {/* Total & Payment */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Total Amount</span>
                  <div className="text-2xl font-black text-[#0B2A6F]">
                    NPR {parseFloat(confirmedBooking.total_amount_npr).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-[#0B2A6F] border border-blue-200">
                    {confirmedBooking.payment_status === 'PAID' ? 'PAID' : 'PAY ON BOARDING'}
                  </span>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-3 bg-amber-50 rounded-xl text-[11px] text-amber-800 font-semibold border border-amber-200 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Please arrive at your boarding stop 15 minutes before scheduled departure time. Keep this reference <strong>{confirmedBooking.booking_reference}</strong> handy for the bus conductor/driver.
                </span>
              </div>

              {/* Buttons */}
              <div className="pt-4 flex items-center justify-between gap-3 print:hidden">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  icon={Printer}
                  onClick={() => window.print()}
                >
                  Print Ticket
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => setSuccessModalOpen(false)}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. POPULAR NEPAL HIGHWAY CORRIDORS CARDS */}
      <section className="py-12 bg-white border-t border-slate-200">
        <Container>
          <SectionTitle
            badge="Travel Nepal By Road"
            title="Explore Nepal's Iconic Highway Corridors"
            subtitle="From lush valley highways to high-altitude mountain trails"
            description="Whether you are traveling for tourism, pilgrimage, or business, we provide reliable road transport across all provinces of Nepal."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {[
              {
                title: 'Kathmandu ➔ Pokhara Corridor',
                highway: 'Prithvi Highway (204 KM)',
                desc: 'Scenic drive along the Trishuli and Marshyangdi rivers. Daily morning departures in VIP 2x1 Sofa and AC buses.',
                fare: 'NPR 1,200 - 1,600',
                image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
              },
              {
                title: 'Kathmandu ➔ Janakpur Dham',
                highway: 'Scenic BP Highway (225 KM)',
                desc: 'Famous serpentine mountain corridor offering panoramic Koshi hills views. Fast HiAce reaches Janakpur in under 6 hours.',
                fare: 'NPR 1,050',
                image: 'https://images.unsplash.com/photo-1559297434-fae8a1916a79?auto=format&fit=crop&w=600&q=80',
              },
              {
                title: 'Pokhara ➔ Jomsom & Muktinath',
                highway: '4WD Mountain Trail (175 KM)',
                desc: 'All-terrain Mahindra Scorpio 4x4 expedition through the Kali Gandaki Gorge to the sacred Muktinath Temple (3,710m).',
                fare: 'NPR 2,600',
                image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
              },
            ].map((route, i) => (
              <div
                key={i}
                className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-200 hover:shadow-lg transition-all group"
              >
                <div className="h-44 overflow-hidden relative">
                  <img
                    src={route.image}
                    alt={route.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-[#0B2A6F]/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-xs">
                    {route.highway}
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-base font-extrabold text-[#0B2A6F] mb-1">{route.title}</h4>
                  <p className="text-xs text-slate-500 mb-4">{route.desc}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <span className="text-xs font-bold text-slate-400">Starting from</span>
                    <span className="text-sm font-black text-[#D71920]">{route.fare}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
};

export default RoadTransportBookingPage;

