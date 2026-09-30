import { timingSafeEqual } from 'node:crypto';
import { cookieNames, verifyAccessToken } from '../services/authService.js';

function readCookie(req, name) {
  const entry = (req.headers.cookie || '').split(';').map((value) => value.trim()).find((value) => value.startsWith(`${name}=`));
  if (!entry) return '';
  try {
    return decodeURIComponent(entry.slice(name.length + 1));
  } catch {
    return '';
  }
}

function constantTimeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length > 0 && leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function requireCsrf(req, res, next) {
  const cookieToken = readCookie(req, cookieNames.csrf);
  const headerToken = req.get('x-csrf-token') || '';
  if (!constantTimeEqual(cookieToken, headerToken)) {
    return res.status(403).json({
      success: false,
      error: { code: 'CSRF_INVALID', message: 'Your session could not be verified. Refresh the page and try again.' },
    });
  }
  return next();
}

export function requireAuth(req, res, next) {
  const authorization = req.get('authorization') || '';
  const match = authorization.match(/^Bearer (.+)$/i);
  if (!match) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHENTICATED', message: 'Please sign in to continue.' },
    });
  }
  try {
    const payload = verifyAccessToken(match[1]);
    req.auth = { userId: payload.sub, role: payload.role, sessionId: payload.sid };
    return next();
  } catch (error) {
    return next(error);
  }
}

export function optionalAuth(req, res, next) {
  const authorization = req.get('authorization') || '';
  const match = authorization.match(/^Bearer (.+)$/i);
  if (!match) return next();
  try {
    const payload = verifyAccessToken(match[1]);
    req.auth = { userId: payload.sub, role: payload.role, sessionId: payload.sid };
    return next();
  } catch (error) {
    return next(error);
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have permission to do that.' },
      });
    }
    return next();
  };
}

export { readCookie };