import { body } from 'express-validator';
import { TASK_PRIORITIES, TASK_STATUSES } from '../constants/taskConstants.js';

export const taskRules = [
  body('title').trim().isLength({ min: 2, max: 160 }).withMessage('Task title must be 2 to 160 characters'),
  body('description').optional().trim().isLength({ max: 1500 }).withMessage('Description is too long'),
  body('status').optional().isIn(TASK_STATUSES).withMessage('Invalid status'),
  body('priority').optional().isIn(TASK_PRIORITIES).withMessage('Invalid priority'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('tags.*').optional().trim().isLength({ min: 1, max: 24 }).withMessage('Tags must be 1 to 24 characters'),
  body('dueDate').isISO8601().toDate().withMessage('Valid due date is required'),
  body('project').isMongoId().withMessage('Valid project id is required'),
  body('assignedTo').isMongoId().withMessage('Valid assigned user id is required')
];

export const statusRules = [
  body('status').isIn(TASK_STATUSES).withMessage('Invalid status')
];

export const commentRules = [
  body('body').trim().isLength({ min: 1, max: 700 }).withMessage('Comment must be 1 to 700 characters')
];
