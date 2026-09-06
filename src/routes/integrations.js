import express from 'express';
import * as integrationController from '../controllers/integrationController.js';
import { isAuthenticated } from '../middleware/auth.js';
import multer from 'multer';

const router = express.Router();
const socialMediaUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024, files: 11 }
});

/**
 * @swagger
 * tags:
 *   name: Integrations
 *   description: Third-party service integrations management
 */

// OAuth Callbacks (Publicly accessible, validated via state)
router.get('/:provider/callback', integrationController.handleCallback);

// Management routes require authentication
router.use(isAuthenticated);

/**
 * @swagger
 * /integrations:
 *   get:
 *     summary: List all active integrations for the current user
 *     tags: [Integrations]
 */
router.get('/', integrationController.listIntegrations);

/**
 * @swagger
 * /integrations/{provider}/auth:
 *   get:
 *     summary: Initiate OAuth flow for a provider
 *     tags: [Integrations]
 */
router.get('/:provider/auth', integrationController.initiateAuth);

/**
 * @swagger
 * /integrations/ai-post:
 *   post:
 *     summary: Generate a social media post summary using AI
 *     tags: [Integrations]
 */
router.post('/ai-post', integrationController.generateSocialPost);

/**
 * @swagger
 * /integrations/ai-post/image:
 *   post:
 *     summary: Generate a LinkedIn-ready image using AI
 *     tags: [Integrations]
 */
router.post('/ai-post/image', integrationController.generateSocialPostImage);

/**
 * @swagger
 * /integrations/linkedin/post:
 *   post:
 *     summary: Publish a text, image, or generated document post to LinkedIn
 *     tags: [Integrations]
 */
router.post('/linkedin/post', socialMediaUpload.fields([
    { name: 'media', maxCount: 1 },
    { name: 'slideImages', maxCount: 10 }
]), integrationController.publishLinkedInPost);

/**
 * @swagger
 * /integrations/{provider}:
 *   put:
 *     summary: Update/Setup a third-party integration (e.g., github)
 *     tags: [Integrations]
 */
router.put('/:provider', integrationController.updateIntegration);

/**
 * @swagger
 * /integrations/{provider}/sync:
 *   post:
 *     summary: Manually trigger a sync for an integration
 *     tags: [Integrations]
 */
router.post('/:provider/sync', integrationController.syncIntegration);

/**
 * @swagger
 * /integrations/{provider}:
 *   delete:
 *     summary: Remove an integration
 *     tags: [Integrations]
 */
router.delete('/:provider', integrationController.removeIntegration);

export default router;
