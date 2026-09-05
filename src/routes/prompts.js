import express from 'express';
import { isAuthenticated } from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import validate from '../middleware/validate.js';
import { previewPromptSchema, updatePromptSchema } from '../validation/promptSchemas.js';
import * as promptController from '../controllers/promptController.js';

const router = express.Router();

router.use(isAuthenticated, adminAuth);

router.get('/', promptController.listPrompts);
router.post('/reset-all', promptController.resetAllPrompts);
router.put('/:key', validate(updatePromptSchema), promptController.updatePrompt);
router.post('/:key/preview', validate(previewPromptSchema), promptController.previewPrompt);
router.post('/:key/reset', promptController.resetPrompt);
router.get('/:key/revisions', promptController.listRevisions);
router.post('/:key/rollback/:revisionId', promptController.rollbackPrompt);

export default router;
