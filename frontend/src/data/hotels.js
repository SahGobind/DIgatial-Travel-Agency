export const mockHotels = [
  {
    id: 'hotel-dxb-01',
    name: 'Rove Dubai Marina',
    city: 'Dubai',
    country: 'United Arab Emirates',
    category: 'Middle East',
    stars: 4,
    rating: 4.8,
    reviewsCount: 342,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    address: 'Al Seba Street, Dubai Marina, Dubai, UAE',
    pricePerNight: 12500,
    discountedFrom: 15000,
    tags: ['Breakfast Included', 'Near Metro', 'Swimming Pool'],
    description: 'Modern lifestyle hotel located in the bustling heart of Dubai Marina with panoramic skyline views, 24/7 fitness center, and high-speed Wi-Fi.',
    amenities: ['Free High-Speed WiFi', 'Infinity Swimming Pool', 'Gym / Fitness Center', 'Airport Shuttle', 'Restaurant & Cafe', 'Air Conditioning'],
    roomTypes: [
      { name: 'Rover Room Marina View', capacity: '2 Adults', price: 12500 },
      { name: 'Deluxe Family Suite', capacity: '2 Adults, 2 Children', price: 21000 }
    ]
  },
  {
    id: 'hotel-doh-02',
    name: 'Doha Corniche Palace Hotel',
    city: 'Doha',
    country: 'Qatar',
    category: 'Middle East',
    stars: 5,
    rating: 4.9,
    reviewsCount: 280,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    address: 'Corniche Promenade, West Bay, Doha, Qatar',
    pricePerNight: 16800,
    discountedFrom: 19500,
    tags: ['5-Star Luxury', 'Sea View', 'Halal Dining'],
    description: 'Premier 5-star oasis on Doha Corniche offering opulent sea-view suites, world-class spa facilities, and direct access to Souq Waqif.',
    amenities: ['Private Beach Access', 'Luxury Spa & Sauna', 'Complimentary Buffet Breakfast', 'Executive Lounge', 'Valet Parking'],
    roomTypes: [
      { name: 'Executive Sea View Room', capacity: '2 Adults', price: 16800 },
      { name: 'Royal Arabic Suite', capacity: '3 Adults', price: 28000 }
    ]
  },
  {
    id: 'hotel-kul-03',
    name: 'Grand Millennium Kuala Lumpur',
    city: 'Kuala Lumpur',
    country: 'Malaysia',
    category: 'Asia',
    stars: 5,
    rating: 4.7,
    reviewsCount: 410,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    address: '160 Bukit Bintang Street, Bukit Bintang, Kuala Lumpur, Malaysia',
    pricePerNight: 9800,
    discountedFrom: 12000,
    tags: ['Bukit Bintang Mall Area', 'Free Cancellation', 'Outdoor Pool'],
    description: 'Situated in the golden triangle of Bukit Bintang adjacent to Pavilion Kuala Lumpur shopping mall, ideal for tourists and business travelers.',
    amenities: ['Outdoor Resort Pool', 'Spa Treatment', 'International Dining', 'Soundproof Rooms', 'Free WiFi'],
    roomTypes: [
      { name: 'Deluxe City King', capacity: '2 Adults', price: 9800 },
      { name: 'Club Executive Suite', capacity: '2 Adults', price: 15500 }
    ]
  },
  {
    id: 'hotel-jkp-04',
    name: 'Hotel Mithila Heritage & Suites',
    city: 'Janakpur Dham',
    country: 'Nepal',
    category: 'Pilgrimage',
    stars: 4,
    rating: 4.8,
    reviewsCount: 195,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
    address: 'Near Janaki Temple, Ramanand Chowk, Janakpur Dham, Nepal',
    pricePerNight: 4500,
    discountedFrom: 5500,
    tags: ['Close to Janaki Temple', 'Pure Vegetarian Cuisine', 'Mithila Art Deco'],
    description: 'Traditional Mithila heritage accommodation offering modern comfort, serene courtyards, authentic Maithili dining, and 5-minute walking proximity to Janaki Mandir.',
    amenities: ['Pure Veg Maithili Restaurant', '24/7 Power Backup & Hot Water', 'Temple Tour Escort', 'Free WiFi', 'AC Rooms'],
    roomTypes: [
      { name: 'Standard AC Double Room', capacity: '2 Adults', price: 4500 },
      { name: 'Mithila Heritage Family Suite', capacity: '4 Persons', price: 7500 }
    ]
  },
  {
    id: 'hotel-ktm-05',
    name: 'Kathmandu Marriott Hotel',
    city: 'Kathmandu',
    country: 'Nepal',
    category: 'Luxury',
    stars: 5,
    rating: 4.9,
    reviewsCount: 520,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80',
    address: 'Manakamana Marg, Naxal, Kathmandu, Nepal',
    pricePerNight: 18500,
    discountedFrom: 22000,
    tags: ['5-Star International', 'Rooftop Lounge', 'Casino & Spa'],
    description: 'Contemporary luxury in central Kathmandu featuring rooftop infinity pool, multi-cuisine dining, full-service spa, and transit shuttle to Tribhuvan International Airport.',
    amenities: ['Rooftop Swimming Pool', 'Casino Pride', 'Full-service Wellness Spa', 'Airport Transit Shuttle', 'High-Speed WiFi'],
    roomTypes: [
      { name: 'Deluxe King Room', capacity: '2 Adults', price: 18500 },
      { name: 'Executive Club Lounge Suite', capacity: '2 Adults', price: 29000 }
    ]
  },
  {
    id: 'hotel-bkk-06',
    name: 'Amari Bangkok & Pratunam Suites',
    city: 'Bangkok',
    country: 'Thailand',
    category: 'Asia',
    stars: 5,
    rating: 4.8,
    reviewsCount: 390,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    address: '847 Petchburi Road, Pratunam, Ratchathewi, Bangkok, Thailand',
    pricePerNight: 11200,
    discountedFrom: 13500,
    tags: ['Pratunam Market Shopping', 'Family Friendly', 'Skyline View'],
    description: 'Conveniently located in Pratunam shopping paradise with exquisite Thai hospitality, Breeze Spa, and easy BTS SkyTrain transit connectivity.',
    amenities: ['Outdoor Pool & Garden', 'Breeze Spa', 'Complimentary Breakfast', 'Kids Play Zone', 'Free High Speed WiFi'],
    roomTypes: [
      { name: 'Premier King City View', capacity: '2 Adults', price: 11200 },
      { name: 'Grand Deluxe 2-Bedroom', capacity: '4 Persons', price: 19800 }
    ]
  }
];
