import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  plan: { type: String, enum: ['free', 'premium'], default: 'free' },
  status: { type: String, enum: ['active', 'cancelled', 'expired', 'pending'], default: 'active' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, default: null },
  usage: {
    searchesToday: { type: Number, default: 0 },
    searchDate: { type: String, default: '' },
    aiRecsToday: { type: Number, default: 0 },
    aiRecsDate: { type: String, default: '' },
    aiScansThisMonth: { type: Number, default: 0 },
    scansThisMonth: { type: Number, default: 0 },
    scanMonth: { type: String, default: '' },
    aiMessagesToday: { type: Number, default: 0 },
    assistantToday: { type: Number, default: 0 },
    assistantDate: { type: String, default: '' },
  },
  paymentId: { type: mongoose.Schema.Types.ObjectId, default: null },
  autoRenew: { type: Boolean, default: false },
  cancelledAt: { type: Date, default: null },
}, { timestamps: true });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;