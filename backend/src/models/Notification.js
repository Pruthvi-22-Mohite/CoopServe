import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['BOOKING_CONFIRMED', 'JOB_REQUEST', 'STATUS_UPDATE', 'REWARDS', 'SYSTEM', 'GENERAL'],
    default: 'SYSTEM',
    index: true
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Auto-assign custom id if not provided before save
notificationSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `notif_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  }
  next();
});

// Set JSON and Object transform
notificationSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret.id || ret._id.toString();
    delete ret.__v;
    return ret;
  }
});

notificationSchema.set('toObject', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret.id || ret._id.toString();
    delete ret.__v;
    return ret;
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
