import express from 'express';
import { cancelInvite, createInvite, deleteInvite, getInvites, verifyInvite } from '../controllers/inviteController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { inviteRules } from '../validators/inviteValidators.js';

const router = express.Router();

router.get('/verify/:token', verifyInvite);
router.use(protect, authorize('admin'));
router.route('/').get(getInvites).post(inviteRules, validate, createInvite);
router.delete('/:id', deleteInvite);
router.patch('/:id/cancel', cancelInvite);

export default router;
