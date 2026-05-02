import express from 'express';
import { login, me, signup } from '../controllers/authController.js';
import { requestPasswordReset, resetPassword } from '../controllers/passwordController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { loginRules, signupRules } from '../validators/authValidators.js';
import { forgotPasswordRules, resetPasswordRules } from '../validators/passwordValidators.js';

const router = express.Router();

router.post('/signup', signupRules, validate, signup);
router.post('/login', loginRules, validate, login);
router.post('/forgot-password', forgotPasswordRules, validate, requestPasswordReset);
router.post('/reset-password', resetPasswordRules, validate, resetPassword);
router.get('/me', protect, me);

export default router;
