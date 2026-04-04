import express from 'express';
const router = express.Router();
import * as docsController from '../controllers/docsController.js';
import docsAuth from '../middleware/docsAuth.js';

// Documentation Routes
// Base path: /docs
// Apply authentication middleware to all documentation routes
router.use(docsAuth);

/**
 * @route   GET/POST /docs
 * @desc    Documentation index page
 * @access  Public/Protected
 */
router.route('/')
    .get(docsController.listDocs)
    .post(docsController.listDocs);

/**
 * @route   GET/POST /docs/*
 * @desc    Get documentation file by path
 * @access  Public/Protected
 * 
 * Examples:
 * - /docs/guides/quick-start
 * - /docs/api/endpoints
 * - /docs/architecture/plugin-provider-system
 * 
 * Note: Express 5 uses regex pattern for catch-all routes (excluding root)
 */
router.route(/^\/.+/)
    .get(docsController.getDoc)
    .post(docsController.getDoc);

export default router;