import express from 'express';
import * as clientAppController from '../controllers/clientAppController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Publicly available metadata for dropdowns
router.get('/permissions', clientAppController.getAvailablePermissions);

// Management routes require authentication
router.use(isAuthenticated);

router.get('/', clientAppController.getAllClientApps);
router.post('/', clientAppController.createClientApp);
router.get('/:id', clientAppController.getClientApp);
router.post('/:id/devices', clientAppController.registerDevice);
router.patch('/:id', clientAppController.updateClientApp);
router.delete('/:id', clientAppController.deleteClientApp);

export default router;
