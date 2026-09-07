export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  SERVICE_PROVIDER: 'SERVICE_PROVIDER',
  ADMIN: 'ADMIN'
};

export const DEMO_ACCOUNTS = [
  {
    id: 'usr_customer_demo',
    email: 'customer@coopserve.demo',
    password: 'password123',
    name: 'Ananya Sharma',
    phone: '+91 98765 43210',
    role: ROLES.CUSTOMER,
    isDemoAccount: true,
    location: '',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    rewardsPoints: 0,
    memberSince: '2025-11-10'
  },
  {
    id: 'usr_provider_demo',
    email: 'provider@coopserve.demo',
    password: 'password123',
    name: 'Rahul Sharma',
    phone: '+91 98111 22334',
    role: ROLES.SERVICE_PROVIDER,
    isDemoAccount: true,
    location: 'Shivajinagar, Pune',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    skill: 'Electrician & Home Wiring',
    experienceYears: 6,
    trustScore: 94,
    rating: 4.88,
    reviewsCount: 142,
    jobsCompleted: 156,
    isVerified: true,
    isAvailable: true,
    coopMemberId: 'COOP-MH-2025-089',
    memberSince: '2025-06-15',
    startingPrice: 299
  },
  {
    id: 'usr_admin_demo',
    email: 'admin@coopserve.demo',
    password: 'password123',
    name: 'Vikramaditya Deshmukh',
    phone: '+91 98220 99887',
    role: ROLES.ADMIN,
    isDemoAccount: true,
    location: 'Central Pune',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    title: 'Cooperative Operations Lead',
    memberSince: '2025-01-01'
  }
];

export const SERVICE_CATEGORIES = [
  { id: 'cleaning', name: 'Cleaning & Sanitization', icon: 'Sparkles', count: 24, avgPrice: 499 },
  { id: 'plumbing', name: 'Plumbing & Leakage', icon: 'Wrench', count: 18, avgPrice: 349 },
  { id: 'electrical', name: 'Electrical & Wiring', icon: 'Zap', count: 32, avgPrice: 299 },
  { id: 'gardening', name: 'Gardening & Landscaping', icon: 'Trees', count: 12, avgPrice: 399 },
  { id: 'carpentry', name: 'Carpentry & Furniture', icon: 'Hammer', count: 15, avgPrice: 449 },
  { id: 'painting', name: 'Painting & Waterproofing', icon: 'Paintbrush', count: 14, avgPrice: 799 },
  { id: 'appliance', name: 'Appliance Repair', icon: 'Tv', count: 20, avgPrice: 399 },
  { id: 'community', name: 'Community Care & Assistance', icon: 'HeartHandshake', count: 9, avgPrice: 249 }
];

export const PUNE_NEIGHBOURHOODS = [
  'Kothrud',
  'Shivajinagar',
  'Baner',
  'Aundh',
  'Hinjewadi',
  'Kharadi',
  'Viman Nagar',
  'Hadapsar',
  'Wakad',
  'Camp',
  'Deccan Gymkhana',
  'Kalyani Nagar',
  'Bavdhan',
  'Pashan',
  'Karve Nagar'
];

export const SUPPORTED_LOCATIONS = {
  states: [
    { code: 'MH', name: 'Maharashtra', enabled: true },
    { code: 'KA', name: 'Karnataka', enabled: false },
    { code: 'DL', name: 'Delhi NCR', enabled: false },
    { code: 'GJ', name: 'Gujarat', enabled: false }
  ],
  cities: {
    MH: [
      { id: 'pune', name: 'Pune', enabled: true },
      { id: 'mumbai', name: 'Mumbai', enabled: false },
      { id: 'nagpur', name: 'Nagpur', enabled: false }
    ]
  },
  neighbourhoods: {
    pune: PUNE_NEIGHBOURHOODS
  }
};
