import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import AuthSession from '../models/AuthSession.js';
import AuthToken from '../models/AuthToken.js';
import Consent from '../models/Consent.js';
import Pantry from '../models/Pantry.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import UserPreference from '../models/UserPreference.js';
import { sendAuthEmail } from './email/emailService.js';
import logger from '../utils/logger.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const REFRESH_DAYS = Math.min(Math.max(Number(process.env.REFRESH_TOKEN_TTL_DAYS) || 30, 1), 30);
const JWT_SECRET = process.env.JWT_ACCESS_SECRET || (process.env.NODE_ENV === 'production' ? '' : randomBytes(64).toString('hex'));
const REFRESH_COOKIE = 'refreshToken';
const CSRF_COOKIE = 'csrfToken';
const dummyPasswordHash = await argon2.hash(randomBytes(32).toString('hex'), { type: argon2.argon2id });

export class AuthError extends Error {
  constructor(status, code, message, fields) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export function publicUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    accountStatus: user.accountStatus,
    preferredLanguage: user.preferredLanguage,
  };
}

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

function createOpaqueToken() {
  return randomBytes(32).toString('base64url');
}

function cookieOptions(path, httpOnly, maxAge) {
  return {
    httpOnly,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path,
    ...(maxAge ? { maxAge } : {}),
  };
}

export function setCsrfCookie(res, token = createOpaqueToken()) {
  res.cookie(CSRF_COOKIE, token, cookieOptions('/', false, REFRESH_DAYS * DAY_MS));
  return token;
}

export function clearAuthCookies(res) {
  res.clearCookie(REFRESH_COOKIE, cookieOptions('/api/auth', true));
  res.clearCookie(CSRF_COOKIE, cookieOptions('/', false));
}

function issueAccessToken(user, sessionId) {
  if (!JWT_SECRET) throw new AuthError(503, 'AUTH_NOT_CONFIGURED', 'Sign-in is temporarily unavailable.');
  return jwt.sign(
    { sub: String(user._id), role: user.role, sid: String(sessionId) },
    JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_TTL || '15m', issuer: 'recipemaster' },
  );
}

function clientLink(path, token) {
  const base = (process.env.CLIENT_URL || 'http://localhost:5175').replace(/\/$/, '');
  return `${base}${path}?token=${encodeURIComponent(token)}`;
}

async function issueOneTimeToken(user, type) {
  await AuthToken.deleteMany({ userId: user._id, type, usedAt: null });
  const rawToken = createOpaqueToken();
  const expiresAt = new Date(Date.now() + (type === 'password_reset' ? 30 * 60 * 1000 : DAY_MS));
  await AuthToken.create({ userId: user._id, tokenHash: hashToken(rawToken), type, expiresAt });
  return rawToken;
}

async function cleanupRegistration(userId) {
  await Promise.all([
    AuthToken.deleteMany({ userId }),
    UserPreference.deleteMany({ userId }),
    Pantry.deleteMany({ userId }),
    Subscription.deleteMany({ userId }),
    Consent.deleteMany({ userId }),
    User.deleteOne({ _id: userId }),
  ]);
}

export async function registerUser(input) {
  const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
  let user;
  try {
    user = await User.create({
      name: input.name,
      email: input.email,
      passwordHash,
      preferredLanguage: input.preferredLanguage,
    });
  } catch (error) {
    if (error?.code === 11000) throw new AuthError(409, 'EMAIL_ALREADY_REGISTERED', 'An account with this email already exists.');
    throw error;
  }

  const consentVersions = {
    policyVersion: process.env.POLICY_VERSION || '1',
    termsVersion: process.env.TERMS_VERSION || '1',
  };
  const setup = await Promise.allSettled([
    UserPreference.create({ userId: user._id, preferredLanguage: input.preferredLanguage }),
    Pantry.create({ userId: user._id, items: [] }),
    Subscription.create({ userId: user._id, plan: 'free', status: 'active' }),
    Consent.insertMany([
      { userId: user._id, type: 'terms', accepted: true, ...consentVersions },
      { userId: user._id, type: 'privacy', accepted: true, ...consentVersions },
      { userId: user._id, type: 'marketing', accepted: input.marketingConsent, ...consentVersions },
      { userId: user._id, type: 'ai_processing', accepted: input.aiProcessingConsent, ...consentVersions },
    ]),
  ]);
  const setupFailure = setup.find((result) => result.status === 'rejected');
  if (setupFailure) {
    await cleanupRegistration(user._id);
    throw setupFailure.reason;
  }

  return {
    user: publicUser(user),
    message: 'Your account is ready. You can now log in.',
  };
}

async function noteFailedLogin(user) {
  const attempts = (user.failedLoginAttempts || 0) + 1;
  const update = { $inc: { failedLoginAttempts: 1 } };
  if (attempts >= 5) {
    const lockMinutes = Math.min(2 ** Math.min(attempts - 5, 4), 15);
    update.$set = { loginLockUntil: new Date(Date.now() + lockMinutes * 60 * 1000) };
  }
  await User.updateOne({ _id: user._id }, update);
}

async function revokeOldestSessions(userId, sessions, keepCount) {
  const excess = sessions.length - keepCount;
  if (excess <= 0) return;
  const revokedIds = sessions.slice(0, excess).map((session) => session._id);
  await AuthSession.updateMany({ _id: { $in: revokedIds } }, { $set: { revokedAt: new Date() } });
  await User.updateOne({ _id: userId }, { $pull: { refreshTokens: { sessionId: { $in: revokedIds } } } });
}

async function createSession(user, req, res, keepSignedIn = true) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + REFRESH_DAYS * DAY_MS);
  const sessions = await AuthSession.find({ userId: user._id, revokedAt: null, expiresAt: { $gt: now } })
    .sort({ createdAt: 1 }).select('_id createdAt').lean();
  await revokeOldestSessions(user._id, sessions, 4);

  const refreshToken = createOpaqueToken();
  const tokenHash = hashToken(refreshToken);
  const session = await AuthSession.create({
    userId: user._id,
    tokenHash,
    expiresAt,
    userAgent: String(req.get('user-agent') || '').slice(0, 300),
    ip: String(req.ip || '').slice(0, 64),
    persistent: keepSignedIn,
  });
  try {
    await User.updateOne(
      { _id: user._id },
      { $push: { refreshTokens: { $each: [{ sessionId: session._id, tokenHash, createdAt: now }], $slice: -5 } } },
    );
  } catch (error) {
    await AuthSession.deleteOne({ _id: session._id });
    throw error;
  }

  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions('/api/auth', true, keepSignedIn ? REFRESH_DAYS * DAY_MS : undefined));
  setCsrfCookie(res);
  return { accessToken: issueAccessToken(user, session._id), user: publicUser(user) };
}

export async function loginUser(input, req, res) {
  const user = await User.findOne({ email: input.email })
    .select('+passwordHash +failedLoginAttempts +loginLockUntil');
  if (!user) {
    await argon2.verify(dummyPasswordHash, input.password);
    throw new AuthError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
  }

  if (user.loginLockUntil && user.loginLockUntil > new Date()) {
    throw new AuthError(429, 'TOO_MANY_ATTEMPTS', 'Too many attempts. Try again in a few minutes.');
  }
  if (user.accountStatus !== 'active') {
    throw new AuthError(403, 'ACCOUNT_UNAVAILABLE', "This account can't be used right now. Contact support.");
  }

  const matches = await argon2.verify(user.passwordHash, input.password);
  if (!matches) {
    await noteFailedLogin(user);
    throw new AuthError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
  }
  await User.updateOne({ _id: user._id }, { $set: { failedLoginAttempts: 0 }, $unset: { loginLockUntil: 1 } });
  user.lastLoginAt = new Date();
  await user.save();
  const session = await createSession(user, req, res, input.keepSignedIn);
  return session;
}

export function verifyAccessToken(token) {
  if (!JWT_SECRET) throw new AuthError(503, 'AUTH_NOT_CONFIGURED', 'Sign-in is temporarily unavailable.');
  try {
    return jwt.verify(token, JWT_SECRET, { issuer: 'recipemaster' });
  } catch {
    throw new AuthError(401, 'UNAUTHENTICATED', 'Please sign in to continue.');
  }
}

async function revokeAllSessions(userId) {
  await Promise.all([
    AuthSession.updateMany({ userId, revokedAt: null }, { $set: { revokedAt: new Date() } }),
    User.updateOne({ _id: userId }, { $set: { refreshTokens: [] } }),
  ]);
}

export async function rotateSession(rawRefreshToken, req, res) {
  const tokenHash = hashToken(rawRefreshToken);
  const session = await AuthSession.findOne({ tokenHash, revokedAt: null, expiresAt: { $gt: new Date() } })
    .select('+tokenHash +previousTokenHashes');
  if (!session) {
    const reusedSession = await AuthSession.findOne({ previousTokenHashes: tokenHash }).select('+previousTokenHashes');
    if (reusedSession) await revokeAllSessions(reusedSession.userId);
    clearAuthCookies(res);
    throw new AuthError(401, 'UNAUTHENTICATED', 'Please sign in again.');
  }

  const user = await User.findOne({ _id: session.userId, accountStatus: 'active' });
  if (!user) {
    await revokeAllSessions(session.userId);
    clearAuthCookies(res);
    throw new AuthError(401, 'UNAUTHENTICATED', 'Please sign in again.');
  }

  const refreshToken = createOpaqueToken();
  const nextHash = hashToken(refreshToken);
  const rotatedSession = await AuthSession.findOneAndUpdate(
    { _id: session._id, tokenHash, revokedAt: null, expiresAt: { $gt: new Date() } },
    {
      $set: { tokenHash: nextHash, expiresAt: new Date(Date.now() + REFRESH_DAYS * DAY_MS) },
      $push: { previousTokenHashes: { $each: [tokenHash], $slice: -100 } },
    },
    { new: true },
  );
  if (!rotatedSession) {
    await revokeAllSessions(session.userId);
    clearAuthCookies(res);
    throw new AuthError(401, 'UNAUTHENTICATED', 'Please sign in again.');
  }
  await User.updateOne(
    { _id: user._id, 'refreshTokens.sessionId': session._id },
    { $set: { 'refreshTokens.$.tokenHash': nextHash, 'refreshTokens.$.createdAt': new Date() } },
  );
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions('/api/auth', true, rotatedSession.persistent ? REFRESH_DAYS * DAY_MS : undefined));
  setCsrfCookie(res);
  return { accessToken: issueAccessToken(user, session._id), user: publicUser(user) };
}

export async function logoutUser(rawRefreshToken, userId, res) {
  if (rawRefreshToken) {
    const tokenHash = hashToken(rawRefreshToken);
    const session = await AuthSession.findOne({ tokenHash, revokedAt: null }).select('_id userId');
    if (session) {
      await AuthSession.updateOne({ _id: session._id }, { $set: { revokedAt: new Date() } });
      await User.updateOne({ _id: session.userId }, { $pull: { refreshTokens: { sessionId: session._id } } });
    }
  }
  if (userId) {
    await AuthSession.updateMany({ userId, revokedAt: null }, { $set: { revokedAt: new Date() } });
    await User.updateOne({ _id: userId }, { $set: { refreshTokens: [] } });
  }
  clearAuthCookies(res);
}

export async function requestPasswordReset(email) {
  logger.info({ event: 'password_reset_requested' }, 'Password reset requested');
  const user = await User.findOne({ email, accountStatus: 'active' });
  if (!user) return;
  const token = await issueOneTimeToken(user, 'password_reset');
  await sendAuthEmail({ to: user.email, name: user.name, type: 'reset', link: clientLink('/reset-password', token) });
}

export async function resetPassword(input) {
  const record = await AuthToken.findOneAndUpdate(
    {
      tokenHash: hashToken(input.token),
      type: 'password_reset',
      usedAt: null,
      expiresAt: { $gt: new Date() },
    },
    { $set: { usedAt: new Date() } },
    { new: true },
  );
  if (!record) throw new AuthError(400, 'INVALID_OR_EXPIRED_TOKEN', 'This link has expired or was already used. Request a new one.');

  const user = await User.findById(record.userId);
  if (!user || user.accountStatus !== 'active') {
    await AuthToken.updateOne({ _id: record._id }, { $set: { usedAt: new Date() } });
    throw new AuthError(400, 'INVALID_OR_EXPIRED_TOKEN', 'This link has expired or was already used. Request a new one.');
  }
  const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
  await Promise.all([
    User.updateOne({ _id: user._id }, { $set: { passwordHash, failedLoginAttempts: 0, refreshTokens: [] }, $unset: { loginLockUntil: 1 } }),
    AuthSession.updateMany({ userId: user._id, revokedAt: null }, { $set: { revokedAt: new Date() } }),
  ]);
  await AuthToken.updateMany({ userId: user._id, type: 'password_reset', usedAt: null }, { $set: { usedAt: new Date() } });
  logger.info({ event: 'password_reset_completed', userId: String(user._id) }, 'Password reset completed');
}

export async function getCurrentUser(userId) {
  const user = await User.findOne({ _id: userId, accountStatus: 'active' });
  if (!user) throw new AuthError(401, 'UNAUTHENTICATED', 'Please sign in to continue.');
  return publicUser(user);
}

export async function changePassword(userId, sessionId, input) {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user || !(await argon2.verify(user.passwordHash, input.currentPassword))) {
    throw new AuthError(400, 'CURRENT_PASSWORD_INCORRECT', 'Current password is incorrect.');
  }
  user.passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
  await user.save();
  await AuthSession.updateMany({ userId, _id: { $ne: sessionId }, revokedAt: null }, { $set: { revokedAt: new Date() } });
  await User.updateOne({ _id: userId, 'refreshTokens.sessionId': { $ne: sessionId } }, { $pull: { refreshTokens: { sessionId: { $ne: sessionId } } } });
}

export function safeTokenMatch(left, right) {
  const leftBuffer = Buffer.from(String(left || ''));
  const rightBuffer = Buffer.from(String(right || ''));
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export const cookieNames = { refresh: REFRESH_COOKIE, csrf: CSRF_COOKIE };
export const tokenHash = hashToken;