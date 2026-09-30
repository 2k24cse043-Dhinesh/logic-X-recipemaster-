import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'AuthSession', required: true },
  tokenHash: { type: String, required: true },
  createdAt: { type: Date, required: true },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  phone: { type: String, trim: true, maxlength: 30, default: '' },
  passwordHash: { type: String, required: true, select: false },
  profileImage: { type: String, default: '' },
  role: { type: String, enum: ['user', 'editor', 'moderator', 'admin'], default: 'user' },
  accountStatus: { type: String, enum: ['active', 'locked', 'suspended', 'deleted'], default: 'active' },
  preferredLanguage: { type: String, enum: ['en', 'ta', 'hi'], default: 'en' },
  phoneVerified: { type: Boolean, default: false },
  lastLoginAt: { type: Date },
  refreshTokens: { type: [refreshTokenSchema], default: [], validate: (tokens) => tokens.length <= 5 },
  failedLoginAttempts: { type: Number, default: 0, select: false },
  loginLockUntil: { type: Date, select: false },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;