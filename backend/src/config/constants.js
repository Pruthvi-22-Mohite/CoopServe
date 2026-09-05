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
    location: 'Kothrud, Pune',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    rewardsPoints: 450,
    memberSince: '2025-11-10'
  },
  {
    id: 'usr_provider_demo',
    email: 'provider@coopserve.demo',
    password: 'password123',
    name: 'Rahul Sharma',
    phone: '+91 98111 22334',
    role: ROLES.SERVICE_PROVIDER,
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
