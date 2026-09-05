import { DEMO_ACCOUNTS, SERVICE_CATEGORIES, ROLES } from '../config/constants.js';
import { calculateBookingPrice, CATEGORY_BASE_PRICES } from '../utils/pricingCalculator.js';

class InMemoryStore {
  constructor() {
    this.users = DEMO_ACCOUNTS.map(u => ({ ...u, tokenVersion: 0 }));

    this.categories = [
      { id: 'cleaning', name: 'Cleaning & Sanitization', nameHi: 'सफ़ाई और स्वच्छता', nameMr: 'स्वच्छता आणि निर्जंतुकीकरण', icon: 'Sparkles', count: 24, avgPrice: 499, popular: true },
      { id: 'plumbing', name: 'Plumbing & Leakage', nameHi: 'नलसाजी और पाइप रिपेयर', nameMr: 'प्लंबिंग आणि पाईप दुरुस्ती', icon: 'Wrench', count: 18, avgPrice: 349, popular: true },
      { id: 'electrical', name: 'Electrical & Wiring', nameHi: 'इलेक्ट्रिकल और वायरिंग', nameMr: 'इलेक्ट्रिकल आणि वायरिंग', icon: 'Zap', count: 32, avgPrice: 299, popular: true },
      { id: 'gardening', name: 'Gardening & Landscaping', nameHi: 'बागवानी और पेड़-पौधे', nameMr: 'बागकाम आणि वृक्ष संवर्धन', icon: 'Trees', count: 12, avgPrice: 399, popular: false },
      { id: 'carpentry', name: 'Carpentry & Furniture', nameHi: 'बढ़ई और फर्नीचर काम', nameMr: 'सुतारकाम आणि फर्निचर', icon: 'Hammer', count: 15, avgPrice: 449, popular: true },
      { id: 'painting', name: 'Painting & Waterproofing', nameHi: 'पेंटिंग और वॉटरप्रूफिंग', nameMr: 'रंगकाम आणि वॉटरप्रूफिंग', icon: 'Paintbrush', count: 14, avgPrice: 799, popular: false },
      { id: 'appliance', name: 'Appliance Repair', nameHi: 'उपकरण रिपेयर व एसी सर्विस', nameMr: 'उपकरण दुरुस्ती आणि एसी', icon: 'Tv', count: 20, avgPrice: 399, popular: true },
      { id: 'maintenance', name: 'Home Maintenance & Misc', nameHi: 'गृह रखरखाव व सामान्य काम', nameMr: 'घर देखभाल व किरकोळ दुरुस्ती', icon: 'Home', count: 16, avgPrice: 349, popular: false }
    ];

    this.services = [
      {
        id: 'srv_switchboard',
        categoryId: 'electrical',
        title: 'Switchboard Installation & MCB Wiring',
        titleHi: 'स्विचबोर्ड स्थापना और एमसीबी वायरिंग',
        titleMr: 'स्विचबोर्ड बसवणे आणि एमसीबी वायरिंग',
        description: 'Safe replacement of switches, MCBs, socket points, and short-circuit diagnosis with 30-day co-op guarantee.',
        basePrice: 299,
        duration: '45-60 mins',
        rating: 4.91,
        bookingsCount: 910,
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80',
        included: ['Safety earthing check', 'Switch & socket fitting', 'Circuit load testing', 'Clean-up after service']
      },
      {
        id: 'srv_tap_leak',
        categoryId: 'plumbing',
        title: 'Tap Leakage, Mixer & Pipe Repair',
        titleHi: 'नल लीकेज और पाइप रिपेयर',
        titleMr: 'नळ गळती आणि पाईप दुरुस्ती',
        description: 'Complete inspection and fix for dripping faucets, low water pressure, shower mixer, and minor pipe blocks.',
        basePrice: 349,
        duration: '45 mins',
        rating: 4.86,
        bookingsCount: 620,
        image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=500&auto=format&fit=crop&q=80',
        included: ['Washer & cartridge replacement', 'Water pressure test', 'Leak proof sealant application']
      },
      {
        id: 'srv_deep_clean',
        categoryId: 'cleaning',
        title: 'Full Home Deep Cleaning (1-3 BHK)',
        titleHi: 'संपूर्ण घर डीप क्लीनिंग',
        titleMr: 'संपूर्ण घर डीप क्लीनिंग आणि स्वच्छता',
        description: 'Intensive scrubbing, vacuuming, and disinfection for kitchens, bathrooms, floors, and living areas with organic agents.',
        basePrice: 1499,
        duration: '3-4 hrs',
        rating: 4.89,
        bookingsCount: 840,
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&auto=format&fit=crop&q=80',
        included: ['Bathroom tile descaling', 'Kitchen degreasing', 'Floor mechanized buffing', 'Window channel vacuuming']
      },
      {
        id: 'srv_garden_trim',
        categoryId: 'gardening',
        title: 'Balcony & Lawn Landscape Maintenance',
        titleHi: 'बालकनी व बगीचा रखरखाव',
        titleMr: 'बाल्कनी आणि बाग देखभाल',
        description: 'Weeding, pruning, soil aeration, repotting, plant nutrient booster, and organic neem pesticide spray.',
        basePrice: 499,
        duration: '2 hrs',
        rating: 4.78,
        bookingsCount: 310,
        image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22509?w=500&auto=format&fit=crop&q=80',
        included: ['Hedge trimming & shaping', 'Organic soil fertilizing', 'Dead leaf removal', 'Pot repotting (up to 5 pots)']
      },
      {
        id: 'srv_furniture_repair',
        categoryId: 'carpentry',
        title: 'Door Hinge, Lock & Furniture Repair',
        titleHi: 'दरवाजे का लॉक व फर्नीचर रिपेयर',
        titleMr: 'दरवाजा लॉक आणि फर्निचर दुरुस्ती',
        description: 'Precision wood repair, hydraulic hinge replacement, wardrobe alignment, and latch installation.',
        basePrice: 449,
        duration: '1-2 hrs',
        rating: 4.85,
        bookingsCount: 420,
        image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=500&auto=format&fit=crop&q=80',
        included: ['Hinge tightening & lubrication', 'Lock latch fixing', 'Drawer slider alignment']
      },
      {
        id: 'srv_ac_service',
        categoryId: 'appliance',
        title: 'AC Jet Cleaning & Gas Leak Diagnosis',
        titleHi: 'एसी जेट सर्विस और गैस जांच',
        titleMr: 'एसी जेट सर्व्हिस आणि गॅस तपासणी',
        description: 'High-pressure foam jet wash for cooling coils, filter sanitization, drain pipe flush, and amp draw testing.',
        basePrice: 599,
        duration: '1 hr',
        rating: 4.92,
        bookingsCount: 1120,
        image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&auto=format&fit=crop&q=80',
        included: ['Indoor coil foam jet wash', 'Outdoor unit wash', 'Gas pressure & amp check', 'Drain line declogging']
      },
      {
        id: 'srv_wall_touchup',
        categoryId: 'painting',
        title: 'Wall Dampness Touchup & Spot Painting',
        titleHi: 'दीवार सीलन उपचार और टचअप पेंटिंग',
        titleMr: 'भिंत ओलावा उपचार आणि रंगकाम',
        description: 'Anti-fungal putty base, water-lock primer, and color-matched emulsion coat for peeling wall patches.',
        basePrice: 899,
        duration: '2-3 hrs',
        rating: 4.79,
        bookingsCount: 280,
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&auto=format&fit=crop&q=80',
        included: ['Scraping loose paint', 'Waterproofing putty layer', 'Two coats premium emulsion']
      },
      {
        id: 'srv_drill_hang',
        categoryId: 'maintenance',
        title: 'General Drilling, Hanging & Mounting',
        titleHi: 'दीवार ड्रिलिंग व सामान टांगना',
        titleMr: 'ड्रिलिंग आणि वस्तू भिंतीवर लावणे',
        description: 'Secure installation of TV wall mounts, heavy mirrors, curtains, bathroom accessories, and art frames.',
        basePrice: 299,
        duration: '45 mins',
        rating: 4.88,
        bookingsCount: 750,
        image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&auto=format&fit=crop&q=80',
        included: ['Laser leveling alignment', 'Heavy duty wall anchors', 'Up to 4 wall mount points']
      }
    ];

    this.providers = [
      {
        id: 'usr_provider_demo',
        name: 'Rahul Sharma',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        phone: '+91 98111 22334',
        email: 'provider@coopserve.demo',
        role: ROLES.SERVICE_PROVIDER,
        skill: 'Electrician & Home Wiring',
        categories: ['electrical', 'maintenance', 'appliance'],
        experienceYears: 6,
        rating: 4.88,
        reviewsCount: 142,
        jobsCompleted: 156,
        trustScore: 94,
        distanceKm: 1.8,
        location: 'Shivajinagar, Pune',
        serviceAreas: ['Kothrud', 'Shivajinagar', 'Deccan', 'Baner', 'Aundh'],
        startingPrice: 350,
        isVerified: true,
        isAvailable: true,
        availabilityStatus: 'Available Today',
        coopMemberId: 'COOP-MH-2025-089',
        bio: 'Certified master electrician with 6+ years experience in household wiring, inverter setups, and electrical diagnostics. Proud cooperative member committed to transparent pricing.',
        pricingTiers: [
          { item: 'Switchboard / Socket Repair', price: 350 },
          { item: 'MCB / Fuse Box Replacement', price: 450 },
          { item: 'Ceiling Fan Installation & Wiring', price: 400 },
          { item: 'Inverter / Battery Wiring', price: 700 }
        ],
        workHistory: [
          { id: 'CS-2026-00094', customer: 'Deepak Patil', service: 'MCB Distribution Board Fix', date: '2026-08-28', rating: 5.0, verified: true },
          { id: 'CS-2026-00088', customer: 'Sneha Kulkarni', service: 'Kitchen Appliance Wiring', date: '2026-08-25', rating: 4.9, verified: true },
          { id: 'CS-2026-00081', customer: 'Amitabh Sen', service: 'Full House Inverter Setup', date: '2026-08-21', rating: 5.0, verified: true }
        ],
        reviews: [
          { id: 'rev_1', customerName: 'Deepak Patil', rating: 5, date: '28 Aug 2026', comment: 'Rahul was extremely professional, identified the short-circuit in 10 minutes and replaced the faulty MCB cleanly.', serviceTag: 'Electrical Fix' },
          { id: 'rev_2', customerName: 'Sneha Kulkarni', rating: 5, date: '25 Aug 2026', comment: 'Transparent price without any sudden extra charges. The cooperative receipt gave full peace of mind.', serviceTag: 'Wiring' }
        ]
      },
      {
        id: 'prov_priya_verma',
        name: 'Priya Verma',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
        phone: '+91 98223 34455',
        email: 'priya.verma@coopserve.org',
        role: ROLES.SERVICE_PROVIDER,
        skill: 'Deep Cleaning & Sanitization Specialist',
        categories: ['cleaning', 'maintenance'],
        experienceYears: 5,
        rating: 4.93,
        reviewsCount: 198,
        jobsCompleted: 215,
        trustScore: 97,
        distanceKm: 2.4,
        location: 'Kothrud, Pune',
        serviceAreas: ['Kothrud', 'Karve Nagar', 'Warje', 'Bavdhan', 'Erandwane'],
        startingPrice: 500,
        isVerified: true,
        isAvailable: true,
        availabilityStatus: 'Available Today',
        coopMemberId: 'COOP-MH-2025-014',
        bio: 'Head of local Women Cooperative Sanitation Guild. Expert in eco-friendly steam sterilization, kitchen degreasing, and post-renovation cleanup.',
        pricingTiers: [
          { item: 'Bathroom Intensive Scrubbing', price: 500 },
          { item: 'Kitchen Chimney & Deep Clean', price: 700 },
          { item: 'Full 2-BHK Deep Cleaning', price: 1400 },
          { item: 'Sofa & Carpet Shampooing', price: 800 }
        ],
        workHistory: [
          { id: 'CS-2026-00102', customer: 'Vikram Joshi', service: '2-BHK Deep Cleaning', date: '2026-08-30', rating: 5.0, verified: true },
          { id: 'CS-2026-00091', customer: 'Kavita Ranade', service: 'Kitchen Degreasing & Steam', date: '2026-08-27', rating: 4.9, verified: true }
        ],
        reviews: [
          { id: 'rev_3', customerName: 'Vikram Joshi', rating: 5, date: '30 Aug 2026', comment: 'Spotless cleaning! Priya and her team used non-toxic products and left the home sparkling.', serviceTag: 'Deep Clean' },
          { id: 'rev_4', customerName: 'Kavita Ranade', rating: 5, date: '27 Aug 2026', comment: 'Very punctual and thorough. Booking through CoopServe was completely transparent.', serviceTag: 'Kitchen Clean' }
        ]
      },
      {
        id: 'prov_amit_patil',
        name: 'Amit Patil',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
        phone: '+91 98450 11223',
        email: 'amit.patil@coopserve.org',
        role: ROLES.SERVICE_PROVIDER,
        skill: 'Master Plumber & Pipe Engineer',
        categories: ['plumbing', 'maintenance'],
        experienceYears: 8,
        rating: 4.84,
        reviewsCount: 164,
        jobsCompleted: 180,
        trustScore: 92,
        distanceKm: 3.2,
        location: 'Deccan Gymkhana, Pune',
        serviceAreas: ['Deccan', 'Shivajinagar', 'Model Colony', 'FC Road', 'Swargate'],
        startingPrice: 400,
        isVerified: true,
        isAvailable: true,
        availabilityStatus: 'Available Today',
        coopMemberId: 'COOP-MH-2024-112',
        bio: 'Licensed plumbing technician specializing in pressure troubleshooting, drainage line hydro-jetting, and luxury sanitary fitting installations.',
        pricingTiers: [
          { item: 'Faucet & Shower Mixer Repair', price: 400 },
          { item: 'Drainage Declogging & Jet Clean', price: 550 },
          { item: 'Overhead Tank Valve & Motor Fix', price: 700 },
          { item: 'Toilet Flush Cistern Overhaul', price: 500 }
        ],
        workHistory: [
          { id: 'CS-2026-00085', customer: 'Mahesh Gokhale', service: 'Concealed Pipe Leak Detection', date: '2026-08-24', rating: 5.0, verified: true },
          { id: 'CS-2026-00076', customer: 'Nitin Deshpande', service: 'Bathroom Mixer Replacement', date: '2026-08-18', rating: 4.8, verified: true }
        ],
        reviews: [
          { id: 'rev_5', customerName: 'Mahesh Gokhale', rating: 5, date: '24 Aug 2026', comment: 'Fixed a persistent wall leak that 2 previous plumbers could not solve. Fair and honest pricing.', serviceTag: 'Plumbing' }
        ]
      },
      {
        id: 'prov_neha_joshi',
        name: 'Neha Joshi',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
        phone: '+91 98901 66778',
        email: 'neha.joshi@coopserve.org',
        role: ROLES.SERVICE_PROVIDER,
        skill: 'Horticulturist & Balcony Garden Architect',
        categories: ['gardening'],
        experienceYears: 4,
        rating: 4.90,
        reviewsCount: 88,
        jobsCompleted: 96,
        trustScore: 96,
        distanceKm: 2.7,
        location: 'Aundh, Pune',
        serviceAreas: ['Aundh', 'Baner', 'Pashan', 'Balewadi', 'Bavdhan'],
        startingPrice: 300,
        isVerified: true,
        isAvailable: true,
        availabilityStatus: 'Available Tomorrow',
        coopMemberId: 'COOP-MH-2025-201',
        bio: 'Passionate urban botanist providing chemical-free pest control, balcony vertical garden design, and seasonal soil re-mineralization.',
        pricingTiers: [
          { item: 'Balcony Plant Health & Trimming', price: 300 },
          { item: 'Organic Fertilizer & Soil Aeration', price: 500 },
          { item: 'Drip Irrigation Installation', price: 900 }
        ],
        workHistory: [
          { id: 'CS-2026-00079', customer: 'Rohit Vaidya', service: 'Balcony Herb Garden Setup', date: '2026-08-20', rating: 5.0, verified: true }
        ],
        reviews: [
          { id: 'rev_6', customerName: 'Rohit Vaidya', rating: 5, date: '20 Aug 2026', comment: 'Revived all my dying plants and set up an organic herb garden. Outstanding work!', serviceTag: 'Gardening' }
        ]
      },
      {
        id: 'prov_arjun_singh',
        name: 'Arjun Singh',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
        phone: '+91 98234 88990',
        email: 'arjun.singh@coopserve.org',
        role: ROLES.SERVICE_PROVIDER,
        skill: 'Woodcraft Artisan & Furniture Specialist',
        categories: ['carpentry', 'maintenance'],
        experienceYears: 7,
        rating: 4.87,
        reviewsCount: 114,
        jobsCompleted: 130,
        trustScore: 93,
        distanceKm: 4.2,
        location: 'Hadapsar, Pune',
        serviceAreas: ['Hadapsar', 'Magarpatta', 'Kalyani Nagar', 'Viman Nagar', 'Koregaon Park'],
        startingPrice: 450,
        isVerified: true,
        isAvailable: true,
        availabilityStatus: 'Available Today',
        coopMemberId: 'COOP-MH-2024-077',
        bio: 'Specialist in custom teak furniture modification, modular kitchen hinge adjustments, and anti-termite wood treatment.',
        pricingTiers: [
          { item: 'Door Lock & Latch Fitting', price: 450 },
          { item: 'Wardrobe Slider Channel Repair', price: 600 },
          { item: 'Custom Wood Shelf Installation', price: 750 }
        ],
        workHistory: [
          { id: 'CS-2026-00084', customer: 'Alok Nath', service: 'Wardrobe Hinge Realignment', date: '2026-08-23', rating: 4.9, verified: true }
        ],
        reviews: [
          { id: 'rev_7', customerName: 'Alok Nath', rating: 5, date: '23 Aug 2026', comment: 'Arjun brought all tools and realigned all wardrobe doors flawlessly.', serviceTag: 'Carpentry' }
        ]
      },
      {
        id: 'prov_rajesh_pawar',
        name: 'Rajesh Pawar',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
        phone: '+91 98229 44110',
        email: 'rajesh.pawar@coopserve.org',
        role: ROLES.SERVICE_PROVIDER,
        skill: 'AC & Home Appliance Technician',
        categories: ['appliance', 'electrical'],
        experienceYears: 9,
        rating: 4.91,
        reviewsCount: 220,
        jobsCompleted: 245,
        trustScore: 95,
        distanceKm: 5.8,
        location: 'Karve Nagar, Pune',
        serviceAreas: ['Karve Nagar', 'Kothrud', 'Warje', 'Sinhagad Road', 'Erandwane'],
        startingPrice: 450,
        isVerified: true,
        isAvailable: true,
        availabilityStatus: 'Available Today',
        coopMemberId: 'COOP-MH-2024-032',
        bio: 'HVAC and refrigeration specialist with factory certifications. Fast diagnosis of PCB errors, refrigerant leaks, and compressor overhauls.',
        pricingTiers: [
          { item: 'Split AC Foam Jet Wash', price: 600 },
          { item: 'Washing Machine Drum & Motor Fix', price: 500 },
          { item: 'Refrigerator Cooling Repair', price: 450 }
        ],
        workHistory: [
          { id: 'CS-2026-00098', customer: 'Sanjay Shinde', service: 'AC Gas Charge & Jet Clean', date: '2026-08-29', rating: 5.0, verified: true }
        ],
        reviews: [
          { id: 'rev_8', customerName: 'Sanjay Shinde', rating: 5, date: '29 Aug 2026', comment: 'Immediate cooling restored after jet wash. Very polite and knowledgeable.', serviceTag: 'AC Service' }
        ]
      }
    ];

    this.cooperative = {
      name: 'Maharashtra Sahakari Seva Sanstha (CoopServe)',
      totalMembers: 128,
      totalJobsCompleted: 1240,
      trainingPrograms: 8,
      communityInitiatives: 12,
      averageTrustScore: 94.2,
      fairWorkloadDistributionIndex: '87%'
    };

    this.bookings = [
      {
        id: 'CS-2026-00128',
        customerId: 'usr_customer_demo',
        customerName: 'Ananya Sharma',
        customerPhone: '+91 98765 43210',
        providerId: 'usr_provider_demo',
        providerName: 'Rahul Sharma',
        providerPhone: '+91 98111 22334',
        providerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        providerSkill: 'Electrician & Home Wiring',
        providerTrustScore: 94,
        serviceId: 'srv_switchboard',
        serviceTitle: 'Switchboard Installation & Wiring',
        category: 'electrical',
        date: '2026-09-03',
        time: '11:00 AM',
        address: 'Flat 402, Green Meadows, Kothrud, Pune - 411038',
        notes: 'Main hall switchboard sparking intermittently. Please inspect MCB load.',
        status: 'BOOKED', // BOOKED -> PROVIDER_ACCEPTED -> ON_THE_WAY -> ARRIVED -> IN_PROGRESS -> COMPLETED
        pricing: calculateBookingPrice({
          basePrice: 350,
          distanceKm: 1.8,
          extraCharges: 0
        }),
        paymentStatus: 'PAID',
        paymentMethod: 'UPI (Mock)',
        transactionId: 'CS-TXN-984214',
        protectedBooking: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'CS-2026-00115',
        customerId: 'usr_customer_demo',
        customerName: 'Ananya Sharma',
        customerPhone: '+91 98765 43210',
        providerId: 'prov_priya_verma',
        providerName: 'Priya Verma',
        providerPhone: '+91 98223 34455',
        providerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        providerSkill: 'Deep Cleaning Specialist',
        providerTrustScore: 97,
        serviceId: 'srv_deep_clean',
        serviceTitle: 'Full Home Deep Cleaning',
        category: 'cleaning',
        date: '2026-08-20',
        time: '09:30 AM',
        address: 'Flat 402, Green Meadows, Kothrud, Pune - 411038',
        notes: 'Pre-festival sanitization and kitchen degreasing.',
        status: 'COMPLETED',
        pricing: calculateBookingPrice({
          basePrice: 1400,
          distanceKm: 2.4,
          extraCharges: 0
        }),
        paymentStatus: 'PAID',
        paymentMethod: 'Card (Mock)',
        transactionId: 'CS-TXN-872391',
        protectedBooking: true,
        rating: 5,
        review: 'Excellent service by Priya and team. The house looks brand new!',
        createdAt: '2026-08-20T04:00:00.000Z'
      }
    ];

    this.notifications = [
      {
        id: 'notif_1',
        userId: 'usr_customer_demo',
        title: 'Booking Confirmed with Protected Status',
        message: 'Your electrical service booking CS-2026-00128 is confirmed with Rahul Sharma.',
        type: 'BOOKING_CONFIRMED',
        read: false,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'notif_2',
        userId: 'usr_customer_demo',
        title: 'Co-op Loyalty Points Added',
        message: 'You earned 50 CoopServe community points from your recent booking.',
        type: 'REWARDS',
        read: true,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'notif_3',
        userId: 'usr_provider_demo',
        title: 'New Service Request Assigned',
        message: 'New job for Switchboard Installation in Kothrud. Estimated earnings: ₹440.',
        type: 'JOB_REQUEST',
        read: false,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ];

    this.chatMessages = [
      {
        id: 'msg_1',
        bookingId: 'CS-2026-00128',
        senderId: 'usr_provider_demo',
        senderName: 'Rahul Sharma',
        senderRole: 'SERVICE_PROVIDER',
        text: 'Namaste Ananya Ji! I have received your request and am gathering the MCB kit.',
        createdAt: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: 'msg_2',
        bookingId: 'CS-2026-00128',
        senderId: 'usr_customer_demo',
        senderName: 'Ananya Sharma',
        senderRole: 'CUSTOMER',
        text: 'Hello Rahul! Please let me know once you reach the building gate, security will let you in.',
        createdAt: new Date(Date.now() - 1200000).toISOString()
      }
    ];
  }

  getMessages(bookingId) {
    return this.chatMessages.filter(m => m.bookingId === bookingId);
  }

  addMessage(data) {
    const newMsg = {
      id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      bookingId: data.bookingId,
      senderId: data.senderId,
      senderName: data.senderName,
      senderRole: data.senderRole,
      text: data.text,
      createdAt: new Date().toISOString()
    };
    this.chatMessages.push(newMsg);
    return newMsg;
  }

  findUserByEmail(email) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.users.find(u => u.id === id);
  }

  addUser(userData) {
    const newUser = {
      id: `usr_${Date.now()}`,
      ...userData,
      isDemoAccount: false,
      tokenVersion: 0,
      memberSince: new Date().toISOString().split('T')[0]
    };
    this.users.push(newUser);
    return newUser;
  }

  // In-memory token revocation registry
  // TODO: Replace with Redis client (e.g., redisClient.sAdd / sIsMember or key-expiration)
  // once Redis/Mongo infrastructure migration is completed by DB teammate.
  revokeToken(userId, tokenVersion) {
    if (userId && tokenVersion !== undefined) {
      if (!this.revokedTokens) this.revokedTokens = new Set();
      this.revokedTokens.add(`${userId}:${tokenVersion}`);
    }
  }

  isTokenRevoked(userId, tokenVersion) {
    if (!this.revokedTokens) return false;
    return this.revokedTokens.has(`${userId}:${tokenVersion}`);
  }

  incrementTokenVersion(userId) {
    const user = this.findUserById(userId);
    if (user) {
      this.revokeToken(user.id, user.tokenVersion || 0);
      user.tokenVersion = (user.tokenVersion || 0) + 1;
      return user.tokenVersion;
    }
    return null;
  }

  getProviders(filters = {}) {
    let result = [...this.providers];

    if (filters.category && filters.category !== 'all') {
      result = result.filter(p => p.categories.includes(filters.category));
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.skill.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.serviceAreas.some(a => a.toLowerCase().includes(q))
      );
    }

    if (filters.minRating) {
      result = result.filter(p => p.rating >= parseFloat(filters.minRating));
    }

    if (filters.maxPrice) {
      result = result.filter(p => p.startingPrice <= parseFloat(filters.maxPrice));
    }

    if (filters.availableToday === 'true' || filters.availableToday === true) {
      result = result.filter(p => p.availabilityStatus === 'Available Today');
    }

    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'rating':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'distance':
          result.sort((a, b) => a.distanceKm - b.distanceKm);
          break;
        case 'price_low':
          result.sort((a, b) => a.startingPrice - b.startingPrice);
          break;
        case 'trust':
          result.sort((a, b) => b.trustScore - a.trustScore);
          break;
        default:
          // AI Score / relevance
          result.sort((a, b) => (b.trustScore * 0.4 + b.rating * 10 * 0.6) - (a.trustScore * 0.4 + a.rating * 10 * 0.6));
      }
    }

    return result;
  }

  getProviderById(id) {
    return this.providers.find(p => p.id === id);
  }

  getServices(categoryId) {
    if (categoryId && categoryId !== 'all') {
      return this.services.filter(s => s.categoryId === categoryId);
    }
    return this.services;
  }

  getServiceById(id) {
    return this.services.find(s => s.id === id);
  }

  getBookingsByCustomer(customerId) {
    return this.bookings.filter(b => b.customerId === customerId);
  }

  getBookingById(id) {
    return this.bookings.find(b => b.id === id);
  }

  getNotifications(userId) {
    return this.notifications.filter(n => n.userId === userId);
  }

  markNotificationAsRead(id) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) notif.read = true;
    return notif;
  }

  addBooking(data) {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const bookingId = `CS-2026-${randomNum}`;
    const txnId = `CS-TXN-${Math.floor(100000 + Math.random() * 900000)}`;

    const provider = data.providerId ? this.getProviderById(data.providerId) : null;
    const basePrice = Number(
      data.basePrice ||
      data.pricing?.basePrice ||
      data.price ||
      provider?.startingPrice ||
      CATEGORY_BASE_PRICES[data.category] ||
      400
    );
    const distanceKm = data.distanceKm !== undefined
      ? Number(data.distanceKm)
      : (data.pricing?.distanceKm !== undefined
          ? Number(data.pricing.distanceKm)
          : (provider?.distanceKm !== undefined ? Number(provider.distanceKm) : 3.2));
    const extraCharges = Number(data.extraCharges || data.pricing?.extraCharges || 0);

    const pricing = calculateBookingPrice({
      basePrice,
      distanceKm,
      extraCharges
    });

    const newBooking = {
      id: bookingId,
      customerId: data.customerId || 'usr_customer_demo',
      customerName: data.customerName || 'Ananya Sharma',
      customerPhone: data.customerPhone || '+91 98765 43210',
      providerId: data.providerId || 'usr_provider_demo',
      providerName: data.providerName || 'Rahul Sharma',
      providerPhone: data.providerPhone || '+91 98111 22334',
      providerAvatar: data.providerAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      providerSkill: data.providerSkill || 'Electrician & Home Wiring',
      providerTrustScore: data.providerTrustScore || 94,
      serviceId: data.serviceId || 'srv_custom',
      serviceTitle: data.serviceTitle || 'Household Service Booking',
      category: data.category || 'general',
      date: data.date || new Date().toISOString().split('T')[0],
      time: data.time || '11:00 AM',
      address: data.address || 'Flat 402, Green Meadows, Kothrud, Pune - 411038',
      notes: data.notes || '',
      status: 'BOOKED',
      pricing,
      paymentStatus: 'PAID',
      paymentMethod: data.paymentMethod || 'UPI (Mock)',
      transactionId: txnId,
      protectedBooking: true,
      protectionEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.bookings.unshift(newBooking);

    // Create notifications for both customer & provider
    this.notifications.unshift({
      id: `notif_${Date.now()}_cust`,
      userId: newBooking.customerId,
      title: 'Protected Booking Confirmed!',
      message: `Your booking for ${newBooking.serviceTitle} is confirmed with ${newBooking.providerName}. ID: ${newBooking.id}`,
      type: 'BOOKING_CONFIRMED',
      read: false,
      createdAt: new Date().toISOString()
    });

    this.notifications.unshift({
      id: `notif_${Date.now()}_prov`,
      userId: newBooking.providerId,
      title: 'New Service Request Assigned!',
      message: `New booking for ${newBooking.serviceTitle} from ${newBooking.customerName}. Estimated earnings: ₹${newBooking.pricing.workerEarnings}.`,
      type: 'JOB_REQUEST',
      read: false,
      createdAt: new Date().toISOString()
    });

    return newBooking;
  }

  updateUserProfile(userId, updates) {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...updates };
      return this.users[userIndex];
    }
    return null;
  }
}

export const inMemoryStore = new InMemoryStore();
