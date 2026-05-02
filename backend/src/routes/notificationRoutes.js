import express from 'express';
import { getOverdueNotifications } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/overdue', protect, getOverdueNotifications);

export default router;
