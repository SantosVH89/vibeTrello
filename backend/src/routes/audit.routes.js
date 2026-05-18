import { Router } from 'express';
import { boardActivity, cardActivity } from '../controllers/audit.controller.js';
import { exigirAuth, exigirPasswordActualizada } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.get('/cards/:id/activity', exigirAuth, exigirPasswordActualizada, asyncHandler(cardActivity));
router.get('/boards/:id/activity', exigirAuth, exigirPasswordActualizada, asyncHandler(boardActivity));

export default router;

