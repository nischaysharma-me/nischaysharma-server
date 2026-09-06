import express from 'express';
import * as postController from '../controllers/postController.js';
import { isAuthenticated, optionalAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createPostSchema, updatePostSchema } from '../validation/postSchemas.js';

const router = express.Router();

router.post('/', isAuthenticated, validateRequest(createPostSchema), postController.createPost);
router.get('/', optionalAuth, postController.listPosts);
router.get('/:id', optionalAuth, postController.getPost);
router.patch('/:id', isAuthenticated, validateRequest(updatePostSchema), postController.updatePost);
router.post('/:id/publish', isAuthenticated, postController.publishPost);
router.delete('/:id', isAuthenticated, postController.deletePost);

export default router;
