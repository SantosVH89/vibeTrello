import { Router } from 'express';
import {
  changeListType,
  createList,
  deleteList,
  reorderLists,
  updateList
} from '../controllers/lists.controller.js';
import { exigirAuth, exigirPasswordActualizada } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.post('/boards/:boardId/lists', exigirAuth, exigirPasswordActualizada, asyncHandler(createList));
router.put('/lists/:id', exigirAuth, exigirPasswordActualizada, asyncHandler(updateList));
router.patch('/boards/:boardId/lists/reorder', exigirAuth, exigirPasswordActualizada, asyncHandler(reorderLists));
router.patch('/lists/:id/type', exigirAuth, exigirPasswordActualizada, asyncHandler(changeListType));
router.delete('/lists/:id', exigirAuth, exigirPasswordActualizada, asyncHandler(deleteList));

export default router;

