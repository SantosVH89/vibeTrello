import { Router } from 'express';
import {
  activateAdminUser,
  createAdminUser,
  deactivateAdminUser,
  listActiveUsers,
  listAdminUsers,
  resetPasswordAdminUser,
  updateAdminUser
} from '../controllers/users.controller.js';
import { exigirAdmin, exigirAuth, exigirPasswordActualizada } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.get('/users', exigirAuth, exigirPasswordActualizada, asyncHandler(listActiveUsers));

router.get('/admin/users', exigirAuth, exigirPasswordActualizada, exigirAdmin, asyncHandler(listAdminUsers));
router.post('/admin/users', exigirAuth, exigirPasswordActualizada, exigirAdmin, asyncHandler(createAdminUser));
router.put('/admin/users/:id', exigirAuth, exigirPasswordActualizada, exigirAdmin, asyncHandler(updateAdminUser));
router.patch('/admin/users/:id/activate', exigirAuth, exigirPasswordActualizada, exigirAdmin, asyncHandler(activateAdminUser));
router.patch('/admin/users/:id/deactivate', exigirAuth, exigirPasswordActualizada, exigirAdmin, asyncHandler(deactivateAdminUser));
router.patch('/admin/users/:id/reset-password', exigirAuth, exigirPasswordActualizada, exigirAdmin, asyncHandler(resetPasswordAdminUser));

export default router;

