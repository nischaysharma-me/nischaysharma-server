import express from 'express';
import * as educationController from '../controllers/educationController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

router.get('/', isAuthenticated, educationController.getEducation);
router.post('/', isAuthenticated, educationController.createEducation);
router.put('/:id', isAuthenticated, educationController.updateEducation);
router.delete('/:id', isAuthenticated, educationController.deleteEducation);

export default router;
