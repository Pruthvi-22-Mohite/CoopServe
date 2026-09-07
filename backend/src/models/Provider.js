import mongoose from 'mongoose';

const pricingTierSchema = new mongoose.Schema({
  item: { type: String, required: true },
  price: { type: Number, required: true }
}, { _id: false });

const workHistorySchema = new mongoose.Schema({
  id: { type: String, required: true },
  customer: { type: String, required: true },
  service: { type: String, required: true },
  date: { type: String, required: true },
  rating: { type: Number, default: 5.0 },
  verified: { type: Boolean, default: true }
}, { _id: false });

const reviewSchema = new mongoose.Schema({
  id: { type: String, default: () => `rev_${Date.now()}` },
  customerName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  date: { type: String, default: () => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
  comment: { type: String, required: true },
  serviceTag: { type: String, default: 'General Service' }
}, { _id: false });

const providerSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  userId: {
    type: String,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Provider name is required'],
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: '+91 90000 00000',
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Provider email is required'],
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    default: 'SERVICE_PROVIDER'
  },
  skill: {
    type: String,
    required: [true, 'Skill is required'],
    trim: true
  },
  categories: [{
    type: String,
    trim: true,
    index: true
  }],
  experienceYears: {
    type: Number,
    default: 1
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 1.0,
    max: 5.0,
    index: true
  },
  reviewsCount: {
    type: Number,
    default: 0
  },
  jobsCompleted: {
    type: Number,
    default: 0
  },
  trustScore: {
    type: Number,
    default: 85,
    min: 0,
    max: 100,
    index: true
  },
  distanceKm: {
    type: Number,
    default: 3.0
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  serviceAreas: [{
    type: String,
    trim: true
  }],
  startingPrice: {
    type: Number,
    required: [true, 'Starting price is required'],
    default: 299,
    index: true
  },
  isVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  isAvailable: {
    type: Boolean,
    default: true,
    index: true
  },
  availabilityStatus: {
    type: String,
    default: 'Available Today'
  },
  coopMemberId: {
    type: String,
    index: true
  },
  bio: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Active', 'Pending', 'Suspended'],
    default: 'Active'
  },
  deactivationReason: {
    type: String,
    default: null,
    trim: true
  },
  deactivatedAt: {
    type: Date,
    default: null
  },
  deactivatedBy: {
    type: String,
    default: null,
    trim: true
  },
  pricingTiers: [pricingTierSchema],
  workHistory: [workHistorySchema],
  reviews: [reviewSchema]
}, {
  timestamps: true
});

// Auto-assign custom id if not provided before save
providerSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `prov_${this._id.toString()}`;
  }
  next();
});

// Set JSON and Object transform
providerSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret.id || ret._id.toString();
    delete ret.__v;
    return ret;
  }
});

providerSchema.set('toObject', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret.id || ret._id.toString();
    delete ret.__v;
    return ret;
  }
});

const Provider = mongoose.model('Provider', providerSchema);

export default Provider;
