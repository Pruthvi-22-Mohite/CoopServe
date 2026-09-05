/**
 * CoopServe Transparent Pricing & Distance Travel Fee Engine
 * Single Source of Truth for Service Pricing, Distance Slabs, and Earnings Distribution.
 */

// Distance Slabs (Configurable)
export const DISTANCE_FEE_SLABS = [
  { minKm: 0, maxKm: 2, fee: 0, label: '0–2 km (Within Neighborhood)' },
  { minKm: 2, maxKm: 5, fee: 20, label: '2–5 km (Local Area)' },
  { minKm: 5, maxKm: 10, fee: 40, label: '5–10 km (City Suburb)' },
  { minKm: 10, maxKm: Infinity, fee: 80, label: '10+ km (Extended Zone)' }
];

// Base Service Starting Prices by Category (Configurable)
export const CATEGORY_BASE_PRICES = {
  plumbing: 400,
  electrical: 350,
  appliance: 450,
  gardening: 300,
  cleaning: 500,
  carpentry: 450,
  painting: 600,
  maintenance: 300,
  general: 400
};

// Platform Fee Percentage (Configurable, default 10%)
export const PLATFORM_FEE_PERCENT = 10;

/**
 * Calculates travel fee based on distance in km
 * @param {number} distanceKm Distance in kilometers
 * @returns {number} Travel fee amount in ₹
 */
export const calculateTravelFee = (distanceKm) => {
  const dist = Math.max(0, parseFloat(distanceKm) || 0);
  const slab = DISTANCE_FEE_SLABS.find(s => dist >= s.minKm && dist < s.maxKm);
  return slab ? slab.fee : 80;
};

/**
 * Calculates complete transparent price breakdown
 * @param {Object} params
 * @param {number} params.basePrice Base service price (₹)
 * @param {number} params.distanceKm Distance between customer and provider (km)
 * @param {number} [params.extraCharges=0] Optional extra work or material charges (₹)
 * @returns {Object} Complete pricing breakdown object
 */
export const calculateBookingPrice = ({
  basePrice = 400,
  distanceKm = 3.2,
  extraCharges = 0
}) => {
  const base = Math.max(0, Math.round(Number(basePrice) || 0));
  const dist = Math.max(0, parseFloat(distanceKm) || 0);
  const travelFee = calculateTravelFee(dist);
  const extra = Math.max(0, Math.round(Number(extraCharges) || 0));

  const customerTotal = base + travelFee + extra;
  const platformFee = Math.round(customerTotal * (PLATFORM_FEE_PERCENT / 100));
  const workerEarnings = customerTotal - platformFee;

  return {
    basePrice: base,
    distanceKm: dist,
    travelFee,
    extraCharges: extra,
    customerTotal,
    customerPayment: customerTotal, // backward compatibility
    platformFee,
    platformOperations: platformFee, // backward compatibility
    workerEarnings
  };
};
