import express from 'express';
import * as jobController from '../controllers/jobController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Async job processing and status checking
 */

/**
 * @swagger
 * /jobs:
 *   post:
 *     summary: Queue a new job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 example: "article-generation"
 *               data:
 *                 type: object
 *                 example: { "topic": "AI Trends", "depth": "standard" }
 *     responses:
 *       202:
 *         description: Job queued
 */
router.post('/', isAuthenticated, jobController.createJob);

/**
 * @swagger
 * /jobs/{id}:
 *   get:
 *     summary: Get job status
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job details
 */
router.get('/:id', isAuthenticated, jobController.getJobStatus);

export default router;
