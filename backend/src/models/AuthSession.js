import mongoose from 'mongoose';

const authSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true, unique: true, select: false },
  previousTokenHashes: { type: [String], default: [], select: false },
  userAgent: { type: String, maxlength: 300, default: '' },
  ip: { type: String, maxlength: 64, default: '' },
  persistent: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true },
  revokedAt: { type: Date, default: null },
}, { timestamps: true });

authSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
authSessionSchema.index({ previousTokenHashes: 1 });

const AuthSession = mongoose.model('AuthSession', authSessionSchema);

export default AuthSession;