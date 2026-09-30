import { createHash } from 'node:crypto';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  forgotPassword,
  login,
  logout,
  me,
  refresh,
  register,
  reset,
  updatePassword,
} from '../controllers/authController.js';
import { requireAuth, requireCsrf } from '../middleware/authMiddleware.js';
import requireDatabase from '../middleware/requireDatabase.js';

const router = Router();
const minute = 60 * 1000;
const hour = 60 * minute;

function limited(windowMs, limit, keyGenerator) {
  return rateLimit({
    windowMs,
    limit,
    ...(keyGenerator ? { keyGenerator } : {}),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res) => res.status(429).json({
      success: false,
      error: { code: 'TOO_MANY_ATTEMPTS', message: 'Too many attempts. Try again in a few minutes.' },
    }),
  });
}

const emailKey = (req) => createHash('sha256')
  .update(String(req.body?.email || '').trim().toLowerCase())
  .digest('hex');

router.use(requireDatabase);
router.post('/register', limited(hour, 5), register);
router.post('/login', limited(15 * minute, 15), limited(hour, 8, emailKey), login);
router.post('/logout', requireCsrf, logout);
router.post('/refresh', requireCsrf, refresh);
router.post('/forgot-password', limited(hour, 15), limited(hour, 5, emailKey), forgotPassword);
router.post('/reset-password', limited(hour, 20), reset);
router.get('/me', requireAuth, me);
router.post('/change-password', requireAuth, limited(hour, 10), updatePassword);

export default router;