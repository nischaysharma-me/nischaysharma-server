import express from 'express';
import * as postController from '../controllers/postController.js';
import { isAuthenticated, optionalAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createPostSchema, updatePostSchema, generatePostSchema, generatePostImageSchema } from '../validation/postSchemas.js';

const router = express.Router();

router.post('/', isAuthenticated, validateRequest(createPostSchema), postController.createPost);
router.post('/generate', isAuthenticated, validateRequest(generatePostSchema), postController.generatePost);
router.get('/', optionalAuth, postController.listPosts);
router.get('/:id', optionalAuth, postController.getPost);
router.patch('/:id', isAuthenticated, validateRequest(updatePostSchema), postController.updatePost);
router.post('/:id/generate-image', isAuthenticated, validateRequest(generatePostImageSchema), postController.generatePostImage);
router.post('/:id/publish', isAuthenticated, postController.publishPost);
router.delete('/:id', isAuthenticated, postController.deletePost);

export default router;
