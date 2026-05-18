import { Router } from 'express';
import { changePassword, login, me } from '../controllers/auth.controller.js';
import { asyncHandler } from '../utils/async-handler.js';
import { exigirAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/login', asyncHandler(login));
router.get('/me', exigirAuth, asyncHandler(me));
router.post('/change-password', exigirAuth, asyncHandler(changePassword));

export default router;

