import mongoose from 'mongoose';

const savedAddressSchema = new mongoose.Schema({
  id: { type: String, default: () => `addr_${Date.now()}` },
  label: { type: String, default: 'Home' },
  address: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
}, { _id: false });

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  phone: {
    type: String,
    default: '+91 90000 00000',
    trim: true
  },
  role: {
    type: String,
    enum: ['CUSTOMER', 'SERVICE_PROVIDER', 'ADMIN'],
    default: 'CUSTOMER',
    index: true
  },
  avatar: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  state: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  neighbourhood: {
    type: String,
    default: ''
  },
  lat: {
    type: Number,
    default: null
  },
  lng: {
    type: Number,
    default: null
  },
  isDemoAccount: {
    type: Boolean,
    default: false,
    index: true
  },
  tokenVersion: {
    type: Number,
    default: 0
  },
  resetPasswordToken: {
    type: String,
    default: null,
    index: true
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  trustedContact: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' }
  },
  rewardsPoints: {
    type: Number,
    default: 0
  },
  memberSince: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  // Service provider profile extension fields when role === 'SERVICE_PROVIDER'
  skill: {
    type: String,
    default: ''
  },
  customSkill: {
    type: String,
    default: ''
  },
  experienceYears: {
    type: Number,
    default: 1
  },
  trustScore: {
    type: Number,
    default: 85
  },
  rating: {
    type: Number,
    default: 0
  },
  reviewsCount: {
    type: Number,
    default: 0
  },
  jobsCompleted: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  coopMemberId: {
    type: String,
    default: ''
  },
  workerId: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
    default: ''
  },
  vehicleAvailable: {
    type: Boolean,
    default: false
  },
  startingPrice: {
    type: Number,
    default: 299
  },
  title: {
    type: String,
    default: ''
  },
  savedAddresses: [savedAddressSchema]
}, {
  timestamps: true
});

// Auto-assign custom id if not provided before save
userSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `usr_${this._id.toString()}`;
  }
  next();
});

// Set JSON and Object transform
userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret.id || ret._id.toString();
    delete ret.__v;
    return ret;
  }
});

userSchema.set('toObject', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret.id || ret._id.toString();
    delete ret.__v;
    return ret;
  }
});

const User = mongoose.model('User', userSchema);

export default User;
