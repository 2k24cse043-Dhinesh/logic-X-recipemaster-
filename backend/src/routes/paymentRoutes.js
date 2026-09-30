import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { cancel, createOrder, paymentHistory, verifyOrder, webhook } from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import requireDatabase from '../middleware/requireDatabase.js';

const router = Router();
const paymentLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({ success: false, error: { code: 'TOO_MANY_ATTEMPTS', message: 'Too many payment attempts. Please try again later.' } }),
});

router.use(requireDatabase);
router.post('/webhook', paymentLimit, webhook);
router.post('/create-order', requireAuth, paymentLimit, createOrder);
router.post('/verify', requireAuth, paymentLimit, verifyOrder);
router.get('/', requireAuth, paymentHistory);
router.post('/subscription/cancel', requireAuth, paymentLimit, cancel);

export default router;