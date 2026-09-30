import { emailSchema, loginSchema, registerSchema, resetPasswordSchema, changePasswordSchema } from '../validators/authValidators.js';
import { readCookie } from '../middleware/authMiddleware.js';
import { cookieNames } from '../services/authService.js';
import {
  changePassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  rotateSession,
} from '../services/authService.js';
import logger from '../utils/logger.js';

function handle(action) {
  return async (req, res, next) => {
    try {
      await action(req, res);
    } catch (error) {
      next(error);
    }
  };
}

export const register = handle(async (req, res) => {
  const result = await registerUser(registerSchema.parse(req.body));
  res.status(201).json({ success: true, data: result });
});

export const login = handle(async (req, res) => {
  const result = await loginUser(loginSchema.parse(req.body), req, res);
  res.json({ success: true, data: result });
});

export const refresh = handle(async (req, res) => {
  const token = readCookie(req, cookieNames.refresh);
  if (!token) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Please sign in again.' } });
  }
  const result = await rotateSession(token, req, res);
  return res.json({ success: true, data: result });
});

export const logout = handle(async (req, res) => {
  const token = readCookie(req, cookieNames.refresh);
  await logoutUser(token, req.auth?.userId, res);
  res.json({ success: true, message: 'You have been signed out.' });
});

export const forgotPassword = handle(async (req, res) => {
  const { email } = emailSchema.parse(req.body);
  setImmediate(() => {
    requestPasswordReset(email).catch((error) => logger.error({ err: error }, 'Password reset processing failed'));
  });
  res.status(202).json({
    success: true,
    data: { message: "If an account exists for that email, we've sent a link to reset your password. The link expires in 30 minutes." },
  });
});

export const reset = handle(async (req, res) => {
  await resetPassword(resetPasswordSchema.parse(req.body));
  res.json({ success: true, message: 'Your password has been reset. Sign in with your new password.' });
});

export const me = handle(async (req, res) => {
  const user = await getCurrentUser(req.auth.userId);
  res.json({ success: true, data: { user } });
});

export const updatePassword = handle(async (req, res) => {
  await changePassword(req.auth.userId, req.auth.sessionId, changePasswordSchema.parse(req.body));
  res.json({ success: true, message: 'Your password has been changed.' });
});