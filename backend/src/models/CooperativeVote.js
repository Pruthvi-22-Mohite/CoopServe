import mongoose from 'mongoose';

const cooperativeVoteSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  initiativeId: {
    type: String,
    required: [true, 'Initiative ID is required'],
    index: true
  },
  initiativeTitle: {
    type: String,
    default: 'Cooperative Standards & Certification Ballot',
    trim: true
  },
  voterId: {
    type: String,
    required: [true, 'Voter ID is required'],
    index: true
  },
  voterName: {
    type: String,
    trim: true
  },
  voterRole: {
    type: String,
    enum: ['CUSTOMER', 'SERVICE_PROVIDER', 'ADMIN'],
    default: 'SERVICE_PROVIDER'
  },
  decision: {
    type: String,
    enum: ['YES', 'NO', 'FOR', 'AGAINST', 'ABSTAIN'],
    default: 'FOR'
  },
  voteWeight: {
    type: Number,
    default: 1 // Democratic 1 Member 1 Vote policy
  },
  signature: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Enforce 1 Member 1 Vote per initiative
cooperativeVoteSchema.index({ initiativeId: 1, voterId: 1 }, { unique: true });

// Auto-assign custom id and signature if not provided before save
cooperativeVoteSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `vote_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  }
  if (!this.signature) {
    this.signature = `COOP-LEDGER-SIG-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;
  }
  next();
});

// Set JSON and Object transform
cooperativeVoteSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret.id || ret._id.toString();
    delete ret.__v;
    return ret;
  }
});

cooperativeVoteSchema.set('toObject', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret.id || ret._id.toString();
    delete ret.__v;
    return ret;
  }
});

const CooperativeVote = mongoose.model('CooperativeVote', cooperativeVoteSchema);

export default CooperativeVote;
