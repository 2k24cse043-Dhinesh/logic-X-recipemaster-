import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  provider: { type: String, enum: ['razorpay'], required: true },
  providerOrderId: { type: String, required: true, unique: true },
  providerPaymentId: { type: String, unique: true, sparse: true },
  planInterval: { type: String, enum: ['monthly', 'yearly'], required: true },
  amountPaise: { type: Number, required: true, min: 1 },
  currency: { type: String, required: true, default: 'INR' },
  status: { type: String, enum: ['created', 'paid', 'failed', 'refunded'], default: 'created' },
  paidAt: { type: Date },
  providerPayload: { type: mongoose.Schema.Types.Mixed, select: false },
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;