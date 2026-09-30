import mongoose from 'mongoose';

const consentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['terms', 'privacy', 'marketing', 'ai_processing'], required: true },
  accepted: { type: Boolean, required: true },
  policyVersion: { type: String, default: '' },
  termsVersion: { type: String, default: '' },
  acceptedAt: { type: Date, default: Date.now },
  withdrawnAt: { type: Date, default: null },
  source: { type: String, default: 'registration' },
}, { timestamps: true });

const Consent = mongoose.model('Consent', consentSchema);

export default Consent;