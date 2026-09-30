import { Router } from 'express';
import { recognize } from '../controllers/pantryController.js';
import requireDatabase from '../middleware/requireDatabase.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();
router.use(requireDatabase);
router.post('/recognize', requireAuth, recognize);

export default router;
