import { Router } from 'express';
import { publicPlans, updatePlans, usage } from '../controllers/planController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import requireDatabase from '../middleware/requireDatabase.js';

const router = Router();
router.use(requireDatabase);
router.get('/plans', publicPlans);
router.get('/subscriptions/usage', requireAuth, usage);
router.put('/admin/settings/plans', requireAuth, requireRole('admin'), updatePlans);

export default router;