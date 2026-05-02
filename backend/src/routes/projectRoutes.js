import express from 'express';
import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  updateProject
} from '../controllers/projectController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { projectRules } from '../validators/projectValidators.js';

const router = express.Router();

router.use(protect);
router.route('/').get(getProjects).post(authorize('admin'), projectRules, validate, createProject);
router
  .route('/:id')
  .get(getProject)
  .put(authorize('admin'), projectRules, validate, updateProject)
  .delete(authorize('admin'), deleteProject);

export default router;
