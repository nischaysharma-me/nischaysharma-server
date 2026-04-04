import express from 'express';
import conversationController from '../controllers/conversationController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Conversations
 *   description: AI Conversation thread management
 */

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Create a new thread
router.post('/', conversationController.createThread);

// Get all threads for the authenticated user
router.get('/', conversationController.getUserThreads);

// Get a specific thread by ID
router.get('/:threadId', conversationController.getThread);

// Update a thread's metadata (title, pinned status)
router.patch('/:threadId', conversationController.updateThread);

// Stream a reply in an existing thread
router.post('/:threadId/stream', conversationController.streamReply);

// Delete a thread
router.delete('/:threadId', conversationController.deleteThread);

export default router;
