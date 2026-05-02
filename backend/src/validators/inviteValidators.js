import { body } from 'express-validator';

export const inviteRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('role').optional().isIn(['member', 'admin']).withMessage('Role must be member or admin')
];
