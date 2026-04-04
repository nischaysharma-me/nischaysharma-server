import express from 'express';
import * as eventController from '../controllers/eventController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Real-time Event tracking and history
 */

// All routes require authentication
router.use(isAuthenticated);

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Store a received WebSocket event
 *     tags: [Events]
 */
router.post('/', eventController.storeEvent);

/**
 * @swagger
 * /events:
 *   get:
 *     summary: List user events history
 *     tags: [Events]
 */
router.get('/', eventController.listUserEvents);

export default router;
