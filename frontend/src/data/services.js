export const mainServicesData = [
  {
    id: 'air-ticketing',
    title: 'Air Ticketing',
    icon: 'Plane',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
    description: 'Domestic and international flight booking assistance with flexible travel options and lowest fares.',
    features: [
      'Domestic Flights',
      'International Flights',
      'One Way & Round Trip',
      'Multi-City Routes',
      'Instant E-Ticket Delivery',
    ],
    buttonText: 'Request a Ticket',
    route: '/services/tickets',
    badge: 'Fast E-Ticket',
  },
  {
    id: 'visa-assistance',
    title: 'Visa Assistance',
    icon: 'FileCheck',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    description: 'Professional guidance and document support for seamless visa approval.',
    features: [
      'Tourist Visa',
      'Business Visa',
      'Visit & Family Visa',
      'Student Visa Support',
      'Embassy Appointment Booking',
    ],
    buttonText: 'Apply for Visa',
    route: '/services/visa',
    badge: 'High Approval',
  },
  {
    id: 'hotel-booking',
    title: 'Hotel Booking',
    icon: 'Building2',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    description: 'Find comfortable hotels at competitive prices for your business or leisure travel worldwide.',
    features: [
      'Budget & Standard Stays',
      'Luxury Resorts',
      'Business City Hotels',
      'Family Friendly Suites',
      'Instant Check-in Voucher',
    ],
    buttonText: 'Find Hotels',
    route: '/services/hotels',
    badge: 'Best Rates',
  },
];

export const whyChooseServicesData = [
  {
    title: 'Experienced Team',
    description: 'Certified travel consultants and visa specialists with extensive knowledge of global airlines and consular regulations.',
  },
  {
    title: 'Trusted Assistance',
    description: 'Government authorized travel management providing transparent documentation and legal certainty.',
  },
  {
    title: 'Transparent Process',
    description: 'Clear itemized billing, genuine airline fare calculations, and upfront guidance with zero hidden fees.',
  },
  {
    title: 'Customer Support',
    description: 'Dedicated phone, WhatsApp, and in-person desk support at our Janakpur Dham office throughout your travel journey.',
  },
  {
    title: 'Competitive Pricing',
    description: 'Direct partnerships with leading domestic and international airlines to secure the lowest flight fares and hotel tariffs.',
  },
  {
    title: 'Complete Travel Solutions',
    description: 'All-inclusive packages uniting flight reservations, visa processing, accommodations, insurance, and curated tour packages.',
  },
];

export const serviceProcessSteps = [
  {
    step: '01',
    title: 'Choose Your Service',
    description: 'Select Air Ticketing, Visa Assistance, or Hotel Bookings to get started.',
  },
  {
    step: '02',
    title: 'Submit Your Request',
    description: 'Fill in your journey dates, destination, or passport details online or at our branch.',
  },
  {
    step: '03',
    title: 'Our Team Contacts You',
    description: 'Our specialists review your request, offer the best options, and guide you through verification.',
  },
  {
    step: '04',
    title: 'Complete Your Journey',
    description: 'Receive your confirmed tickets, approved visas, or hotel vouchers ready for departure.',
  },
];

export const serviceFaqsData = [
  {
    question: 'What services do you provide?',
    answer:
      'Digital World Tour & Travels provides domestic and international air ticketing, comprehensive visa processing (Tourist, Visit, Business, Student), and global hotel reservations for UAE, Qatar, Saudi Arabia, Malaysia, Thailand, and destinations worldwide.',
  },
  {
    question: 'Can I request a flight ticket online?',
    answer:
      'Yes, you can submit your flight itinerary (One Way, Round Trip, or Multi-City) via our Ticket Request page or contact us on 9702022094 / 9812193621. We will immediately check the lowest fares across all airlines and issue your electronic ticket.',
  },
  {
    question: 'Can you help with visa documents?',
    answer:
      'Absolutely. Our team provides complete visa documentation assistance including appointment booking, document translation/notarization advice, itinerary creation, cover letters, and embassy submission tracking.',
  },
  {
    question: 'Do you provide hotel booking?',
    answer:
      'Yes, we book verified hotels across major worldwide destinations matching your budget preferences—from economical stays to luxury 5-star resorts with instant confirmation vouchers.',
  },
  {
    question: 'Where is your office located?',
    answer:
      'Our central office is located at Thapa Chowk, Janakpur Dham, Dhanusha, Nepal. You can visit us in person or call/WhatsApp us on 9702022094 or 9812193621 7 days a week.',
  },
];

// Backwards compatibility export
export const servicesData = mainServicesData;
