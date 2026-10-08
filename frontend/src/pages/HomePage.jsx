import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plane, 
  FileText, 
  Building2, 
  Briefcase, 
  ShieldCheck, 
  Users, 
  BadgePercent, 
  Globe2, 
  ArrowRight, 
  Star,
  MapPin,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
  Compass,
  Check,
  GraduationCap,
  BriefcaseBusiness,
  Luggage,
  Quote
} from 'lucide-react';
import Container from '../components/common/Container';
import Button from '../components/common/Button';
import SectionTitle from '../components/common/SectionTitle';

export const HomePage = () => {
  // FAQ Accordion active state
  const [openFaq, setOpenFaq] = useState(0);

  // Animated Flight Images Slideshow (5-second duration)
  const heroSlides = [
    {
      id: 1,
      image: '/flights/flight-1.png',
      alt: 'Commercial passenger airliner soaring above sea of clouds',
      badge: 'Worldwide Flights',
      title: 'Fly To Any Destination',
      subtitle: 'Lowest airfare guarantee for Gulf, Southeast Asia, Europe & Americas.',
    },
    {
      id: 2,
      image: '/flights/flight-2.png',
      alt: 'Modern airliner cruising smoothly against deep blue sky',
      badge: 'Partner Airlines',
      title: 'Trusted Global Carriers',
      subtitle: 'Direct bookings with Qatar Airways, FlyDubai, Nepal Airlines & Air Arabia.',
    },
    {
      id: 3,
      image: '/flights/flight-3.png',
      alt: 'Aircraft wing overlooking clouds in golden sunrise glow',
      badge: 'Luxury & Comfort',
      title: 'Unforgettable Journeys',
      subtitle: 'Complete visa documentation, prompt ticketing and 24/7 travel desk support.',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000); // 5 seconds duration
    return () => clearInterval(interval);
  }, [isPaused, heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const destinations = [
    {
      id: 'dubai',
      name: 'Dubai',
      country: 'United Arab Emirates',
      tagline: 'Futuristic Skyline & World Class Shopping',
      startingPrice: 'NPR 37,500',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'qatar',
      name: 'Qatar',
      country: 'Qatar (Doha)',
      tagline: 'Modern Culture & Business Gateway',
      startingPrice: 'NPR 35,000',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1570783307775-58532fa5a7aa?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'saudi-arabia',
      name: 'Saudi Arabia',
      country: 'Kingdom of Saudi Arabia',
      tagline: 'Historical Heritage & Economic Hub',
      startingPrice: 'NPR 39,000',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'malaysia',
      name: 'Malaysia',
      country: 'Malaysia (Kuala Lumpur)',
      tagline: 'Truly Asia - Nature & Vibrant City Life',
      startingPrice: 'NPR 29,500',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const whyChooseUsData = [
    {
      icon: Users,
      title: 'Experienced Team',
      description: 'Over a decade of hands-on expertise in international ticketing, airline reservations, and consular processing.',
    },
    {
      icon: ShieldCheck,
      title: 'Reliable Service',
      description: 'Government registered travel and tour agency guaranteeing authenticity and legal compliance.',
    },
    {
      icon: Compass,
      title: 'Complete Travel Support',
      description: 'End-to-end guidance spanning domestic air travel, international visas, hotel stays, and airport transfers.',
    },
    {
      icon: CalendarCheck,
      title: 'Easy Booking',
      description: 'Quick paperless reservations, digital invoices, and hassle-free date rescheduling with top airline partners.',
    },
    {
      icon: BadgePercent,
      title: 'Transparent Process',
      description: 'Clear pricing with zero hidden charges, transparent visa counseling, and transparent fare structures.',
    },
    {
      icon: Globe2,
      title: 'Customer Assistance',
      description: 'Dedicated phone, WhatsApp, and in-person desk support at our Janakpur Dham office 7 days a week.',
    },
  ];

  const howItWorksSteps = [
    {
      step: '01',
      title: 'Choose a Service',
      description: 'Select from Air Ticketing, Visa Assistance, Hotel Booking, or Holiday Packages.',
      icon: Compass,
    },
    {
      step: '02',
      title: 'Submit Your Request',
      description: 'Provide your travel dates, destination, or accommodation preferences online or at our office.',
      icon: FileText,
    },
    {
      step: '03',
      title: 'Get Expert Assistance',
      description: 'Our consultants verify documents, find the lowest airline rates, and process your booking.',
      icon: Users,
    },
    {
      step: '04',
      title: 'Complete Your Journey',
      description: 'Receive your confirmed tickets, approved visas, and hotel vouchers with total peace of mind.',
      icon: Plane,
    },
  ];

  const visaCategories = [
    {
      type: 'Tourist Visa',
      icon: Luggage,
      desc: 'Fast visa processing for holiday trips to Dubai, Malaysia, Thailand, Singapore, and Europe.',
      badge: 'Popular',
    },
    {
      type: 'Work Visa',
      icon: Briefcase,
      desc: 'Complete documentation, medical check guidance, and stamping for UAE, Qatar, Saudi Arabia, and Gulf states.',
      badge: 'High Demand',
    },
    {
      type: 'Business Visa',
      icon: BriefcaseBusiness,
      desc: 'Expedited processing for corporate travelers, business meetings, trade expos, and conferences abroad.',
      badge: 'Fast-Track',
    },
    {
      type: 'Student Visa',
      icon: GraduationCap,
      desc: 'Guidance and visa application assistance for international universities and college admissions.',
      badge: 'Guidance',
    },
  ];

  const demoTestimonials = [
    {
      name: 'Sonu Kumar',
      role: 'International Traveler',
      location: 'Janakpur Dham',
      rating: 5,
      comment:
        'Digital World Tour & Travels made my Dubai flight booking effortless. Their team found me the lowest airfare and provided fast visa documentation support within days.',
    },
    {
      name: 'Ramesh Chaudhary',
      role: 'Holiday Traveler (Qatar & Dubai)',
      location: 'Dhanusha',
      rating: 5,
      comment:
        'Very transparent and genuine travel consulting. Everything from visa verification to flight tickets and hotel stays was handled professionally with complete honesty.',
    },
    {
      name: 'Pooja Jha',
      role: 'Family Vacationer',
      location: 'Kathmandu / Janakpur',
      rating: 5,
      comment:
        'Excellent hotel reservations and family holiday package in Malaysia. Highly recommended travel agency at Thapa Chowk, Janakpur Dham for peace of mind.',
    },
  ];

  const faqs = [
    {
      question: 'How can I book a flight?',
      answer:
        'You can book your domestic or international flight tickets by calling our hotlines (9702022094 / 9812193621), submitting an inquiry on our website, or visiting our office directly at Thapa Chowk, Janakpur Dham. We compare all major airlines to give you the lowest available rate and issue instant e-tickets.',
    },
    {
      question: 'What documents are required for visa processing?',
      answer:
        'Standard documentation generally includes a valid passport (with at least 6 months validity), passport-size photographs with white background, citizenship certificate copy, and travel itinerary. Specific requirements vary depending on whether you are applying for a Tourist, Work, Business, or Student visa.',
    },
    {
      question: 'Can you help with hotel booking?',
      answer:
        'Yes! We arrange verified luxury, business, and budget hotel stays worldwide with guaranteed check-in, flexible cancellation options, and discounted rates for solo travelers, families, and tour groups.',
    },
    {
      question: 'What holiday tour packages do you offer?',
      answer:
        'We design customized vacation and holiday tour packages for Dubai, Malaysia, Thailand, Qatar, Saudi Arabia, as well as cultural and spiritual tours across Nepal and India with flight tickets, visas, and hotel reservations included.',
    },
    {
      question: 'How can I contact your office?',
      answer:
        'Our central office is located at Thapa Chowk, Janakpur Dham, Dhanusha, Nepal. You can call or WhatsApp us on 9702022094 or 9812193621. We are open 7 days a week from 8:00 AM to 7:00 PM.',
    },
  ];

  return (
    <div className="w-full">
      {/* 1. HERO SECTION */}
      <section className="relative bg-[#071941] text-white pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        {/* Mountain Lake Background Image & Layered Overlays */}
        <div className="absolute inset-0 z-0">
          <img
            src="/mountain-lake-bg.jpg"
            alt="Scenic mountain lake landscape background"
            className="w-full h-full object-cover object-center scale-105 transform motion-safe:animate-[pulse_10s_ease-in-out_infinite]"
          />
          {/* Multi-layered gradient overlays for readability and scenic beauty */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#071941]/90 via-[#0B2A6F]/70 to-[#071941]/50"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#071941] via-transparent to-[#071941]/60"></div>
          
          {/* Decorative Background Glows & Pattern */}
          <div className="absolute top-0 right-0 w-[550px] h-[550px] rounded-full bg-blue-400/20 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[550px] h-[550px] rounded-full bg-[#D71920]/20 blur-3xl pointer-events-none"></div>
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none"></div>
        </div>

        <Container className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Top Tag / Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs sm:text-sm font-semibold text-blue-100 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-[#D71920] animate-ping"></span>
                <span>Janakpur Dham's Premier Travel Agency</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Your Journey, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-amber-200">
                  Our Responsibility
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg md:text-xl text-blue-100/90 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Complete travel solutions for flights, visas, hotels and holiday tours.
              </p>

              {/* Hero CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Button
                  to="/services/tickets"
                  variant="danger"
                  size="lg"
                  icon={Plane}
                  className="w-full sm:w-auto shadow-lg shadow-red-900/30"
                >
                  Book a Ticket
                </Button>

                <Button
                  to="/services"
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-[#0B2A6F]"
                >
                  Explore Services
                </Button>
              </div>
            </div>

            {/* Right Visual Image Card with 5-Second Animated Flight Showcase */}
            <div 
              className="lg:col-span-5 relative group"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 bg-gradient-to-tr from-slate-900 to-blue-950 h-84 sm:h-96">
                {/* 5-Second Countdown Progress Bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/20 z-30 overflow-hidden">
                  <div
                    key={currentSlide + (isPaused ? '-paused' : '')}
                    className={`h-full bg-gradient-to-r from-amber-400 via-[#D71920] to-amber-300 ${
                      isPaused ? 'w-full opacity-60' : 'animate-slide-progress'
                    }`}
                  />
                </div>

                {/* Slides */}
                {heroSlides.map((slide, index) => {
                  const isActive = index === currentSlide;
                  return (
                    <div
                      key={slide.id}
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                      }`}
                    >
                      <img
                        src={slide.image}
                        alt={slide.alt}
                        className={`w-full h-full object-cover object-center transform transition-transform duration-[5000ms] ease-out ${
                          isActive ? 'scale-110' : 'scale-100'
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#071941]/95 via-[#071941]/40 to-black/20"></div>

                      <div className="absolute bottom-6 left-6 right-6 text-white space-y-1.5 z-20">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-300/30 backdrop-blur-sm">
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          {slide.badge}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight drop-shadow-md">
                          {slide.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-blue-100/90 drop-shadow line-clamp-2">
                          {slide.subtitle}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Navigation Arrows (Hover Visible) */}
                <button
                  onClick={prevSlide}
                  aria-label="Previous flight image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/40 hover:bg-[#D71920] text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 border border-white/20 shadow-lg cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextSlide}
                  aria-label="Next flight image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/40 hover:bg-[#D71920] text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 border border-white/20 shadow-lg cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Slide Indicators / Thumbnails Bar */}
                <div className="absolute top-4 right-4 z-30 flex items-center gap-2 bg-[#071941]/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-md">
                  {heroSlides.map((slide, idx) => (
                    <button
                      key={slide.id}
                      onClick={() => setCurrentSlide(idx)}
                      aria-label={`View slide ${idx + 1}`}
                      className={`transition-all duration-300 rounded-full cursor-pointer flex items-center justify-center ${
                        idx === currentSlide
                          ? 'w-6 h-2 bg-[#D71920]'
                          : 'w-2 h-2 bg-white/60 hover:bg-white'
                      }`}
                    />
                  ))}
                  <span className="text-[10px] font-mono text-blue-200 pl-1">
                    {currentSlide + 1}/3
                  </span>
                </div>
              </div>

              {/* Floating Mini Badge 1 */}
              <div className="absolute -top-4 -left-4 bg-white text-[#0B2A6F] p-3 rounded-2xl shadow-xl flex items-center gap-2.5 border border-slate-100 z-30">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  ✓
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold leading-tight">100% Verified</p>
                  <p className="text-[10px] text-slate-500">Genuine Visa &amp; Tickets</p>
                </div>
              </div>

              {/* Floating Mini Badge 2 */}
              <div className="absolute -bottom-4 -right-4 bg-white text-[#0B2A6F] p-3 rounded-2xl shadow-xl flex items-center gap-2.5 border border-slate-100 z-30">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-[#D71920] flex items-center justify-center font-bold animate-pulse">
                  ★
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold leading-tight">Best Fare Assured</p>
                  <p className="text-[10px] text-slate-500">Janakpur Dham Office</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. SERVICE QUICK ACTIONS (4 Cards under hero) */}
      <section className="relative z-20 -mt-10">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Card 1: Air Ticketing */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200/80 hover:border-blue-300 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0B2A6F] flex items-center justify-center mb-4 group-hover:bg-[#0B2A6F] group-hover:text-white transition-colors duration-200">
                  <Plane className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#172033] mb-1">
                  Air Ticketing
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Domestic &amp; international flight tickets with lowest fare guarantee.
                </p>
              </div>
              <Button
                to="/services/tickets"
                variant="outline"
                size="sm"
                icon={ArrowRight}
                iconPosition="right"
                className="w-full justify-between mt-2"
              >
                Book Flight
              </Button>
            </div>

            {/* Card 2: Visa Assistance */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200/80 hover:border-blue-300 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#123D8D] flex items-center justify-center mb-4 group-hover:bg-[#123D8D] group-hover:text-white transition-colors duration-200">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#172033] mb-1">
                  Visa Assistance
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Complete visa processing support for tourist, visit, and business visas.
                </p>
              </div>
              <Button
                to="/services/visa"
                variant="outline"
                size="sm"
                icon={ArrowRight}
                iconPosition="right"
                className="w-full justify-between mt-2"
              >
                Apply Visa
              </Button>
            </div>

            {/* Card 3: Hotel Booking */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200/80 hover:border-red-300 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-red-50 text-[#D71920] flex items-center justify-center mb-4 group-hover:bg-[#D71920] group-hover:text-white transition-colors duration-200">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#172033] mb-1">
                  Hotel Booking
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Comfortable hotels at the best prices with verified accommodations.
                </p>
              </div>
              <Button
                to="/services/hotels"
                variant="outline"
                size="sm"
                icon={ArrowRight}
                iconPosition="right"
                className="w-full justify-between mt-2"
              >
                Find Hotels
              </Button>
            </div>

            {/* Card 4: Holiday & Tour Packages */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200/80 hover:border-emerald-300 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#172033] mb-1">
                  Holiday Packages
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Curated international &amp; domestic vacation packages at discounted group rates.
                </p>
              </div>
              <Button
                to="/destinations"
                variant="outline"
                size="sm"
                icon={ArrowRight}
                iconPosition="right"
                className="w-full justify-between mt-2"
              >
                Explore Tours
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* 3. TRUST FEATURES SECTION */}
      <section className="bg-[#F5F8FC] py-14 border-b border-slate-200/60 mt-10">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {/* Trust 1 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#0B2A6F] shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="text-center sm:text-left">
                <h4 className="text-sm font-bold text-[#172033]">Trusted Service</h4>
                <p className="text-xs text-slate-500">Govt. Registered Agency</p>
              </div>
            </div>

            {/* Trust 2 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#0B2A6F] shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-center sm:text-left">
                <h4 className="text-sm font-bold text-[#172033]">Experienced Team</h4>
                <p className="text-xs text-slate-500">10+ Years Travel Expertise</p>
              </div>
            </div>

            {/* Trust 3 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-[#D71920] shrink-0">
                <BadgePercent className="w-6 h-6" />
              </div>
              <div className="text-center sm:text-left">
                <h4 className="text-sm font-bold text-[#172033]">Best Price</h4>
                <p className="text-xs text-slate-500">Guaranteed Low Fares</p>
              </div>
            </div>

            {/* Trust 4 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <Globe2 className="w-6 h-6" />
              </div>
              <div className="text-center sm:text-left">
                <h4 className="text-sm font-bold text-[#172033]">Global Support</h4>
                <p className="text-xs text-slate-500">24/7 Hotline Assistance</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 4. POPULAR DESTINATIONS */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <SectionTitle
            badge="Top Routes"
            title="Popular Destinations"
            subtitle="Explore the world with us"
            description="Special flight packages, visa facilitation, and hotel arrangements for prime international hubs."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mt-12">
            {destinations.map((dest) => (
              <div
                key={dest.id}
                className="group rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"></div>
                  
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-[#0B2A6F] text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{dest.rating}</span>
                  </div>

                  <div className="absolute bottom-3 left-3 text-white">
                    <h4 className="text-xl font-bold">{dest.name}</h4>
                    <p className="text-xs text-blue-100 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#D71920]" />
                      {dest.country}
                    </p>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {dest.tagline}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Fares from</span>
                      <span className="text-lg font-extrabold text-[#0B2A6F]">
                        {dest.startingPrice}
                      </span>
                    </div>

                    <Button to="/destinations" variant="primary" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button to="/destinations" variant="outline" size="md" icon={ArrowRight} iconPosition="right">
              View All Destinations
            </Button>
          </div>
        </Container>
      </section>

      {/* 4.5 FLIGHT FLEET & AIRLINE NETWORK SHOWCASE */}
      <section className="py-16 bg-gradient-to-b from-white to-[#F5F8FC] border-t border-slate-200">
        <Container>
          <SectionTitle
            badge="Aviation Network"
            title="Modern Fleet & Global Flight Connections"
            subtitle="Fly with world-class airlines to over 150+ worldwide destinations"
            description="Our direct booking channel connects Janakpur Dham to all major domestic and international hubs."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {heroSlides.map((flight, idx) => (
              <div
                key={flight.id}
                onClick={() => setCurrentSlide(idx)}
                className={`cursor-pointer rounded-2xl overflow-hidden border transition-all duration-300 group ${
                  idx === currentSlide
                    ? 'border-[#D71920] ring-2 ring-[#D71920]/30 shadow-xl scale-[1.02] bg-white'
                    : 'border-slate-200 bg-white hover:shadow-lg hover:border-blue-300'
                }`}
              >
                <div className="relative h-48 overflow-hidden bg-slate-900">
                  <img
                    src={flight.image}
                    alt={flight.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 bg-[#0B2A6F]/90 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Plane className="w-3 h-3 text-amber-400" />
                    {flight.badge}
                  </span>
                  {idx === currentSlide && (
                    <span className="absolute top-3 right-3 bg-[#D71920] text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                      Active (5s Auto)
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h4 className="text-base font-bold text-[#172033] mb-1.5 group-hover:text-[#0B2A6F] transition-colors">
                    {flight.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {flight.subtitle}
                  </p>
                  <div className="flex items-center justify-between text-xs font-semibold text-[#0B2A6F]">
                    <span>Instant Booking Support</span>
                    <span className="text-[#D71920] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Book Now <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 5. WHY CHOOSE US */}
      <section className="py-16 md:py-24 bg-[#F5F8FC] border-t border-slate-200">
        <Container>
          <SectionTitle
            badge="Why Us"
            title="Why Choose Digital World Tour & Travels?"
            subtitle="Committed to excellence, integrity, and client satisfaction"
            description="We combine local presence in Janakpur Dham with global connections to make your travel seamless."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-12">
            {whyChooseUsData.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0B2A6F] flex items-center justify-center mb-5">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#172033] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 6. HOW IT WORKS (4 STEPS) */}
      <section className="py-16 md:py-24 bg-white border-t border-slate-200">
        <Container>
          <SectionTitle
            badge="Simple Process"
            title="How It Works"
            subtitle="Your step-by-step path to hassle-free travel and overseas placements"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-14 relative">
            {howItWorksSteps.map((stepItem, index) => {
              const IconComp = stepItem.icon;
              return (
                <div
                  key={index}
                  className="relative bg-[#F5F8FC] rounded-2xl p-7 border border-slate-200 text-center flex flex-col items-center group hover:bg-blue-50/50 hover:border-blue-300 transition-all duration-300"
                >
                  {/* Step Number Badge */}
                  <span className="absolute -top-4 bg-[#0B2A6F] text-white text-xs font-extrabold px-3.5 py-1 rounded-full shadow-md">
                    Step {stepItem.step}
                  </span>

                  <div className="w-14 h-14 rounded-2xl bg-white text-[#0B2A6F] shadow-sm flex items-center justify-center my-4 group-hover:scale-110 group-hover:bg-[#0B2A6F] group-hover:text-white transition-all duration-200">
                    <IconComp className="w-7 h-7" />
                  </div>

                  <h3 className="text-base font-bold text-[#172033] mb-2">
                    {stepItem.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {stepItem.description}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 7. FOREIGN EMPLOYMENT CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-[#0B2A6F] via-[#0f3482] to-[#123D8D] text-white overflow-hidden relative">
        <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

        <Container className="relative z-10">
          <div className="bg-white/10 rounded-3xl p-8 sm:p-12 border border-white/20 backdrop-blur-md">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
                <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider">
                  Authorized Foreign Recruitment
                </span>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                  Build Your Future Abroad
                </h2>

                <p className="text-sm sm:text-base text-blue-100 max-w-2xl leading-relaxed">
                  Explore genuine employment opportunities and receive professional assistance throughout the process. Complete guidance for UAE, Qatar, Saudi Arabia &amp; Malaysia.
                </p>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs text-blue-100 font-medium">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Genuine Employers
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Legal Documentation
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Pre-Departure Briefing
                  </span>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
                <Button
                  to="/services"
                  variant="danger"
                  size="lg"
                  icon={Briefcase}
                  className="w-full text-center justify-center"
                >
                  View Jobs
                </Button>
                <Button
                  to="/contact"
                  variant="outline"
                  size="lg"
                  className="w-full text-center justify-center text-white border-white hover:bg-white hover:text-[#0B2A6F]"
                >
                  Apply Now
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 8. VISA ASSISTANCE CTA */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left explanation */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D71920]">
                Fast Visa Clearance
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B2A6F] leading-tight">
                Need Help With Your Visa?
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Visa applications can be overwhelming. Our experienced consular team in Janakpur Dham provides complete documentation review, appointment booking, and visa processing for major international destinations.
              </p>

              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-xs sm:text-sm text-slate-700">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                    ✓
                  </div>
                  <span>Accurate documentation verification to prevent rejections.</span>
                </li>
                <li className="flex items-center gap-3 text-xs sm:text-sm text-slate-700">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                    ✓
                  </div>
                  <span>Direct updates and tracking throughout your visa lifecycle.</span>
                </li>
              </ul>

              <div className="pt-2">
                <Button
                  to="/contact"
                  variant="danger"
                  size="lg"
                  icon={FileText}
                >
                  Get Visa Assistance
                </Button>
              </div>
            </div>

            {/* Right 4 Visa category cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {visaCategories.map((visa, idx) => {
                const Icon = visa.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-[#F5F8FC] border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0B2A6F] flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0B2A6F]">
                        {visa.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#172033]">
                      {visa.type}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {visa.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* 9. TESTIMONIALS SECTION (Demo Testimonials) */}
      <section className="py-16 md:py-24 bg-[#F5F8FC] border-t border-slate-200">
        <Container>
          <SectionTitle
            badge="Client Feedback"
            title="What Travelers Say"
            subtitle="Demo reviews representing client experiences with our agency"
          />

          {/* Demo disclaimer badge */}
          <div className="text-center mt-2">
            <span className="inline-block text-[11px] font-semibold text-slate-500 bg-slate-200/80 px-3 py-1 rounded-full">
              * Demo testimonials for software display purposes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-10">
            {demoTestimonials.map((test, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between relative"
              >
                <Quote className="w-8 h-8 text-blue-100 absolute top-5 right-5 pointer-events-none" />

                <div>
                  {/* Star rating */}
                  <div className="flex items-center gap-1 mb-4 text-amber-500">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500" />
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed mb-6">
                    "{test.comment}"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0B2A6F] text-white flex items-center justify-center font-bold text-sm">
                    {test.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#172033]">{test.name}</h4>
                    <p className="text-xs text-slate-500">
                      {test.role} • {test.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 10. FAQ SECTION (Interactive Accordion) */}
      <section className="py-16 md:py-24 bg-white border-t border-slate-200">
        <Container size="narrow">
          <SectionTitle
            badge="Got Questions?"
            title="Frequently Asked Questions"
            subtitle="Find quick answers regarding ticketing, visas, hotel stays, and employment"
          />

          <div className="mt-12 space-y-3.5">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'border-[#0B2A6F] bg-blue-50/30 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 sm:py-5 flex items-center justify-between text-left focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-base font-bold text-[#172033] pr-4">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#0B2A6F] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Container>
      </section>
    </div>
  );
};

export default HomePage;
