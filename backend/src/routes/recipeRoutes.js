import { Router } from 'express';
import { generateDraft, getByShareToken, getBySlug, getPhotoBySlug, list } from '../controllers/recipeController.js';
import requireDatabase from '../middleware/requireDatabase.js';
import { optionalAuth, requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireDatabase);
router.use((req, res, next) => {
	res.set('Cache-Control', 'no-store');
	next();
});
router.get('/', optionalAuth, list);
router.get('/shared/:shareToken', getByShareToken);
router.get('/:slug/photo', getPhotoBySlug);
router.post('/:slug/generate', requireAuth, generateDraft);
router.get('/:slug', getBySlug);

export default router;