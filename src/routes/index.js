import express from 'express';
import userProfileRoutes from './userProfile.js';
import articleRoutes from './articles.js';
import jobRoutes from './jobs.js';
import integrationRoutes from './integrations.js';
import conversationRoutes from './conversations.js';
import bookRoutes from './books.js';
import eventRoutes from './events.js';
import billboardRoutes from './billboards.js';
import projectRoutes from './projects.js';
import experienceRoutes from './experience.js';
import educationRoutes from './education.js';
import * as docsController from '../controllers/docsController.js';

const router = express.Router();

/**
 * API Routes Aggregator
 * 
 * Base path: /api/v1
 */

// User Profile Routes
router.use('/users', userProfileRoutes);

// Article Routes
router.use('/articles', articleRoutes);

// Job Routes
router.use('/jobs', jobRoutes);

// Integration Routes
router.use('/integrations', integrationRoutes);

// Conversation Routes
router.use('/conversations', conversationRoutes);

// Book Routes
router.use('/books', bookRoutes);

// Event Routes
router.use('/events', eventRoutes);

// Billboard Routes
router.use('/billboards', billboardRoutes);

// Project Routes
router.use('/projects', projectRoutes);

// Professional Experience Routes
router.use('/experience', experienceRoutes);

// Academic Background Routes
router.use('/education', educationRoutes);

// Documentation API Routes
router.get('/docs/navigation', docsController.listDocs);
router.get(/\/docs\/content\/(.*)/, docsController.getDoc);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Check if the API is running and healthy
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: API is running
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-11-19T08:00:00.000Z"
 */
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString()
    });
});



export default router;
