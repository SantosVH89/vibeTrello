import { Router } from 'express';
import {
  assignSubtask,
  completeSubtask,
  createSubtask,
  deleteSubtask,
  reopenSubtask,
  reorderSubtasks,
  updateSubtask
} from '../controllers/subtasks.controller.js';
import { exigirAuth, exigirPasswordActualizada } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.post('/cards/:cardId/subtasks', exigirAuth, exigirPasswordActualizada, asyncHandler(createSubtask));
router.put('/subtasks/:id', exigirAuth, exigirPasswordActualizada, asyncHandler(updateSubtask));
router.patch('/subtasks/:id/assign', exigirAuth, exigirPasswordActualizada, asyncHandler(assignSubtask));
router.patch('/subtasks/:id/complete', exigirAuth, exigirPasswordActualizada, asyncHandler(completeSubtask));
router.patch('/subtasks/:id/reopen', exigirAuth, exigirPasswordActualizada, asyncHandler(reopenSubtask));
router.patch('/cards/:cardId/subtasks/reorder', exigirAuth, exigirPasswordActualizada, asyncHandler(reorderSubtasks));
router.delete('/subtasks/:id', exigirAuth, exigirPasswordActualizada, asyncHandler(deleteSubtask));

export default router;

