export const mockInvoices = [
  {
    id: 'DW-2026-00124',
    invoiceNumber: 'DW-2026-00124',
    date: '2026-09-18',
    dueDate: '2026-09-25',
    customer: {
      name: 'Sonu Kumar Sah',
      email: 'sonu.sah@gmail.com',
      phone: '+977 9812193621',
      address: 'Janakpur Dham - 4, Dhanusha, Nepal'
    },
    service: 'Dubai Express Tourist Visa & Flight',
    status: 'Paid',
    items: [
      {
        id: 1,
        service: 'Visa Processing',
        description: 'UAE 30-Day Express Tourist Visa application with document verification & fast-track clearance',
        quantity: 1,
        unitPrice: 16500,
        total: 16500
      },
      {
        id: 2,
        service: 'Flight Ticketing',
        description: 'Flight Ticket KTM to DXB (Kathmandu -> Dubai International), FlyDubai Economy with 30kg baggage',
        quantity: 1,
        unitPrice: 42000,
        total: 42000
      },
      {
        id: 3,
        service: 'Travel Insurance',
        description: 'Comprehensive 30-Day Overseas Travel & Health Protection coverage',
        quantity: 1,
        unitPrice: 3500,
        total: 3500
      }
    ],
    subtotal: 62000,
    discount: 2000,
    tax: 7800, // 13% VAT
    total: 67800,
    paid: 67800,
    balance: 0,
    paymentMethod: 'Online Payment (eSewa)',
    transactionId: 'ESW-9921820491',
    paidAt: '2026-09-18 14:32'
  },
  {
    id: 'DW-2026-00125',
    invoiceNumber: 'DW-2026-00125',
    date: '2026-09-19',
    dueDate: '2026-09-26',
    customer: {
      name: 'Pooja Jha',
      email: 'pooja.jha@outlook.com',
      phone: '+977 9801234567',
      address: 'Ramanand Chowk, Janakpur Dham, Nepal'
    },
    service: 'Qatar Flight & Hotel Package',
    status: 'Pending',
    items: [
      {
        id: 1,
        service: 'Flight Ticketing',
        description: 'Round-trip Flight KTM -> DOH -> KTM (Qatar Airways Business Class)',
        quantity: 1,
        unitPrice: 85000,
        total: 85000
      },
      {
        id: 2,
        service: 'Hotel Booking',
        description: 'Doha Corniche 5-Star Luxury Resort (4 Nights accommodation with breakfast buffet)',
        quantity: 4,
        unitPrice: 12000,
        total: 48000
      }
    ],
    subtotal: 133000,
    discount: 5000,
    tax: 16640,
    total: 144640,
    paid: 50000,
    balance: 94640,
    paymentMethod: 'Bank Transfer (Partial)',
    transactionId: 'NIBL-TXN-48201',
    paidAt: '2026-09-19 11:15'
  },
  {
    id: 'DW-2026-00126',
    invoiceNumber: 'DW-2026-00126',
    date: '2026-09-17',
    dueDate: '2026-09-24',
    customer: {
      name: 'Amit Chaudhary',
      email: 'amit.c@gmail.com',
      phone: '+977 9845112233',
      address: 'Bhanu Chowk, Janakpur Dham, Nepal'
    },
    service: 'Saudi Arabia Work Visa Documentation',
    status: 'Paid',
    items: [
      {
        id: 1,
        service: 'Visa Processing',
        description: 'Saudi Arabia Employment / Work Visa processing, biometric attestation & medical documentation',
        quantity: 1,
        unitPrice: 28000,
        total: 28000
      },
      {
        id: 2,
        service: 'Document Attestation',
        description: 'Ministry of Foreign Affairs (MOFA) & Embassy attestation service package',
        quantity: 1,
        unitPrice: 8500,
        total: 8500
      }
    ],
    subtotal: 36500,
    discount: 1500,
    tax: 4550,
    total: 39550,
    paid: 39550,
    balance: 0,
    paymentMethod: 'Cash Payment',
    transactionId: 'CASH-REC-0089',
    paidAt: '2026-09-17 16:45'
  },
  {
    id: 'DW-2026-00127',
    invoiceNumber: 'DW-2026-00127',
    date: '2026-09-15',
    dueDate: '2026-09-22',
    customer: {
      name: 'Ramesh Yadav',
      email: 'ramesh.yadav@gmail.com',
      phone: '+977 9819283746',
      address: 'Mujeliya, Janakpur Dham, Nepal'
    },
    service: 'Malaysia Holiday Tour & Hotel Stay',
    status: 'Cancelled',
    items: [
      {
        id: 1,
        service: 'Hotel Booking',
        description: 'Kuala Lumpur Bukit Bintang 4-Star Hotel Stay & Tour Package (4 Nights)',
        quantity: 1,
        unitPrice: 35000,
        total: 35000
      }
    ],
    subtotal: 35000,
    discount: 0,
    tax: 4550,
    total: 39550,
    paid: 0,
    balance: 39550,
    paymentMethod: 'N/A',
    transactionId: 'N/A',
    paidAt: null
  },
  {
    id: 'DW-2026-00128',
    invoiceNumber: 'DW-2026-00128',
    date: '2026-09-20',
    dueDate: '2026-09-27',
    customer: {
      name: 'Suman Shrestha',
      email: 'suman.shrestha@hotmail.com',
      phone: '+977 9860129834',
      address: 'Station Road, Janakpur Dham, Nepal'
    },
    service: 'Bangkok Holiday Tour Package',
    status: 'Pending',
    items: [
      {
        id: 1,
        service: 'Tour Package',
        description: '5 Days / 4 Nights Bangkok & Pattaya Grand Vacation Package for 2 Persons',
        quantity: 2,
        unitPrice: 48000,
        total: 96000
      },
      {
        id: 2,
        service: 'Visa Processing',
        description: 'Thailand Tourist Visa on Arrival assistance & documentation',
        quantity: 2,
        unitPrice: 4500,
        total: 9000
      }
    ],
    subtotal: 105000,
    discount: 5000,
    tax: 13000,
    total: 113000,
    paid: 0,
    balance: 113000,
    paymentMethod: 'Pending',
    transactionId: null,
    paidAt: null
  }
];

export const paymentMethods = [
  {
    id: 'cash',
    name: 'Cash Payment',
    icon: 'Banknote',
    desc: 'Pay directly in cash at our Janakpur Dham main branch counter with instant official stamp receipt.'
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    icon: 'Landmark',
    desc: 'Direct wire transfer via Nepal Investment Mega Bank (NIMB), NIC Asia, or Global IME Bank.'
  },
  {
    id: 'card',
    name: 'Credit / Debit Card',
    icon: 'CreditCard',
    desc: 'Visa, MasterCard, or UnionPay accepted with secure 3D-Secure 256-bit encryption.'
  },
  {
    id: 'online',
    name: 'Online Wallet / QR (eSewa / Khalti / Fonepay)',
    icon: 'QrCode',
    desc: 'Scan Fonepay QR code or pay instantly through eSewa / Khalti mobile banking apps.'
  }
];
