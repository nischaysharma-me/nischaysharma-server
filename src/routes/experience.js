import express from 'express';
import * as experienceController from '../controllers/experienceController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

router.get('/', isAuthenticated, experienceController.getExperiences);
router.post('/', isAuthenticated, experienceController.createExperience);
router.put('/:id', isAuthenticated, experienceController.updateExperience);
router.delete('/:id', isAuthenticated, experienceController.deleteExperience);

export default router;
