import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  providerId: {
    type: String,
    required: [true, 'Provider ID is required'],
    index: true
  },
  customerId: {
    type: String,
    index: true
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  bookingId: {
    type: String,
    index: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5,
    index: true
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    trim: true
  },
  serviceTag: {
    type: String,
    default: 'General Service',
    trim: true
  },
  date: {
    type: String,
    default: () => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }
}, {
  timestamps: true
});

// Auto-assign custom id if not provided before save
reviewSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `rev_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

// Set JSON and Object transform
reviewSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret.id || ret._id.toString();
    delete ret.__v;
    return ret;
  }
});

reviewSchema.set('toObject', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret.id || ret._id.toString();
    delete ret.__v;
    return ret;
  }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
