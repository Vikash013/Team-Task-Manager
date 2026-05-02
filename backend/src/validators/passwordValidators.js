import { body } from 'express-validator';

export const forgotPasswordRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
];

export const resetPasswordRules = [
  body('token').isString().notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];
