import { Router } from 'express';
import { tree } from '../controllers/cuisineController.js';
import requireDatabase from '../middleware/requireDatabase.js';

const router = Router();
router.use(requireDatabase);
router.get('/tree', tree);

export default router;