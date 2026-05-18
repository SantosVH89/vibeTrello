import { Router } from 'express';
import {
  assignCard,
  completeCard,
  createCard,
  deleteCard,
  getCard,
  moveCard,
  reopenCard,
  updateCard
} from '../controllers/cards.controller.js';
import { exigirAuth, exigirPasswordActualizada } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.post('/lists/:listId/cards', exigirAuth, exigirPasswordActualizada, asyncHandler(createCard));
router.get('/cards/:id', exigirAuth, exigirPasswordActualizada, asyncHandler(getCard));
router.put('/cards/:id', exigirAuth, exigirPasswordActualizada, asyncHandler(updateCard));
router.patch('/cards/:id/move', exigirAuth, exigirPasswordActualizada, asyncHandler(moveCard));
router.patch('/cards/:id/assign', exigirAuth, exigirPasswordActualizada, asyncHandler(assignCard));
router.patch('/cards/:id/complete', exigirAuth, exigirPasswordActualizada, asyncHandler(completeCard));
router.patch('/cards/:id/reopen', exigirAuth, exigirPasswordActualizada, asyncHandler(reopenCard));
router.delete('/cards/:id', exigirAuth, exigirPasswordActualizada, asyncHandler(deleteCard));
export default router;
