import express from 'express';
const router = express.Router();
import * as stackController from '../controllers/stackController.js';
import { isAuthenticated } from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

// Public route to get stack items
router.get('/', stackController.listStackItems);

// Protected admin routes
router.use(isAuthenticated, adminAuth);

router.post('/', stackController.createStackItem);
router.post('/:id/generate-image', stackController.generateImage);
router.patch('/:id', stackController.updateStackItem);
router.delete('/:id', stackController.deleteStackItem);

export default router;
