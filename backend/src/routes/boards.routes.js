import { Router } from 'express';
import {
  completeBoard,
  createBoard,
  deleteBoard,
  getBoard,
  listBoards,
  reopenBoard,
  updateBoard
} from '../controllers/boards.controller.js';
import { exigirAuth, exigirPasswordActualizada } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.get('/boards', exigirAuth, exigirPasswordActualizada, asyncHandler(listBoards));
router.post('/boards', exigirAuth, exigirPasswordActualizada, asyncHandler(createBoard));
router.get('/boards/:id', exigirAuth, exigirPasswordActualizada, asyncHandler(getBoard));
router.put('/boards/:id', exigirAuth, exigirPasswordActualizada, asyncHandler(updateBoard));
router.patch('/boards/:id/complete', exigirAuth, exigirPasswordActualizada, asyncHandler(completeBoard));
router.patch('/boards/:id/reopen', exigirAuth, exigirPasswordActualizada, asyncHandler(reopenBoard));
router.delete('/boards/:id', exigirAuth, exigirPasswordActualizada, asyncHandler(deleteBoard));
export default router;
