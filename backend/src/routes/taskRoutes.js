import express from 'express';
import {
  createTask,
  deleteTask,
  addTaskComment,
  getTask,
  getTasks,
  updateTask,
  updateTaskStatus
} from '../controllers/taskController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { commentRules, statusRules, taskRules } from '../validators/taskValidators.js';

const router = express.Router();

router.use(protect);
router.route('/').get(getTasks).post(authorize('admin'), taskRules, validate, createTask);
router.patch('/:id/status', statusRules, validate, updateTaskStatus);
router.post('/:id/comments', commentRules, validate, addTaskComment);
router
  .route('/:id')
  .get(getTask)
  .put(authorize('admin'), taskRules, validate, updateTask)
  .delete(authorize('admin'), deleteTask);

export default router;
