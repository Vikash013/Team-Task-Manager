import express from 'express';
import { getMembers, getUsers, removeUser } from '../controllers/userController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));
router.get('/', getUsers);
router.get('/members', getMembers);
router.delete('/:id', removeUser);

export default router;
