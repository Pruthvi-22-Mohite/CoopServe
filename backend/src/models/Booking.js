import mongoose from 'mongoose';

const pricingBreakdownSchema = new mongoose.Schema({
  basePrice: { type: Number, required: true },
  distanceKm: { type: Number, default: 0 },
  travelFee: { type: Number, default: 0 },
  extraCharges: { type: Number, default: 0 },
  customerTotal: { type: Number, required: true },
  customerPayment: { type: Number },
  platformFee: { type: Number, default: 0 },
  platformOperations: { type: Number },
  workerEarnings: { type: Number, required: true }
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  customerId: {
    type: String,
    required: [true, 'Customer ID is required'],
    index: true
  },
  customerName: {
    type: String,
    default: 'Customer',
    trim: true
  },
  customerPhone: {
    type: String,
    default: '+91 98765 43210',
    trim: true
  },
  providerId: {
    type: String,
    required: [true, 'Provider ID is required'],
    index: true
  },
  providerName: {
    type: String,
    default: 'Provider',
    trim: true
  },
  providerPhone: {
    type: String,
    default: '+91 98111 22334',
    trim: true
  },
  providerAvatar: {
    type: String,
    default: ''
  },
  providerSkill: {
    type: String,
    default: 'Certified Professional',
    trim: true
  },
  providerTrustScore: {
    type: Number,
    default: 90
  },
  serviceId: {
    type: String,
    default: 'srv_custom'
  },
  serviceTitle: {
    type: String,
    default: 'Household Service Booking',
    trim: true
  },
  category: {
    type: String,
    default: 'general',
    index: true
  },
  date: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  time: {
    type: String,
    default: '11:00 AM'
  },
  address: {
    type: String,
    default: 'Flat 402, Green Meadows, Kothrud, Pune - 411038'
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: [
      'BOOKED',
      'ACCEPTED',
      'PROVIDER_ACCEPTED',
      'ON_THE_WAY',
      'ARRIVED',
      'IN_PROGRESS',
      'COMPLETED',
      'REJECTED',
      'CANCELLED'
    ],
    default: 'BOOKED',
    index: true
  },
  reviewRequired: {
    type: Boolean,
    default: false
  },
  reviewReason: {
    type: String,
    default: ''
  },
  locationVerification: {
    start: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      distanceMeters: { type: Number, default: null },
      status: { type: String, enum: ['VERIFIED', 'FAILED', 'PENDING'], default: 'PENDING' },
      verifiedAt: { type: Date, default: null },
      reason: { type: String, default: '' }
    },
    completion: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      distanceMeters: { type: Number, default: null },
      status: { type: String, enum: ['VERIFIED', 'FAILED', 'PENDING'], default: 'PENDING' },
      verifiedAt: { type: Date, default: null },
      reason: { type: String, default: '' }
    }
  },
  price: {
    type: Number
  },
  basePrice: {
    type: Number
  },
  distanceKm: {
    type: Number,
    default: 0
  },
  travelFee: {
    type: Number,
    default: 0
  },
  extraCharges: {
    type: Number,
    default: 0
  },
  pricing: pricingBreakdownSchema,
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
    default: 'PENDING'
  },
  razorpayOrderId: {
    type: String,
    index: true,
    sparse: true
  },
  razorpayPaymentId: {
    type: String,
    index: true,
    sparse: true
  },
  razorpaySignature: {
    type: String
  },
  paidAt: {
    type: String
  },
  pendingRating: {
    type: Boolean,
    default: false
  },
  ratingStatus: {
    type: String,
    enum: ['NOT_RATED', 'RATED'],
    default: 'NOT_RATED'
  },
  paymentMethod: {
    type: String,
    default: 'UPI (Mock)'
  },
  transactionId: {
    type: String,
    index: true
  },
  protectedBooking: {
    type: Boolean,
    default: true
  },
  protectionEnabled: {
    type: Boolean,
    default: true
  },
  cancellationReason: {
    type: String,
    default: ''
  },
  cancelledAt: {
    type: String
  },
  completedAt: {
    type: String
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String
  }
}, {
  timestamps: true
});

// Auto-assign custom id and txnId if not provided before save
bookingSchema.pre('save', function (next) {
  if (!this.id) {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    this.id = `CS-2026-${randomNum}`;
  }
  if (!this.transactionId) {
    this.transactionId = `CS-TXN-${Math.floor(100000 + Math.random() * 900000)}`;
  }
  next();
});

// Set JSON and Object transform
bookingSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret.id || ret._id.toString();
    delete ret.__v;
    return ret;
  }
});

bookingSchema.set('toObject', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret.id || ret._id.toString();
    delete ret.__v;
    return ret;
  }
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
