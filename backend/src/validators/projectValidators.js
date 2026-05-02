import { body } from 'express-validator';

export const projectRules = [
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Project name must be 2 to 120 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description is too long'),
  body('teamMembers').optional().isArray().withMessage('Team members must be an array'),
  body('teamMembers.*').optional().isMongoId().withMessage('Invalid team member id')
];
