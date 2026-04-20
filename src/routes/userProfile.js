import express from 'express';
import * as userController from '../controllers/userProfileController.js';
import { isAuthenticated } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { updateUserSchema } from '../validation/userSchemas.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile management
 */

// Public routes
router.get('/public/admin', userController.getPublicAdminProfile);
router.get('/public/home', userController.getHomeData);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);

// Middleware for authenticated routes
router.use(isAuthenticated);

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get('/me', userController.getMe);

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *               occupation:
 *                 type: string
 *               bio:
 *                 type: string
 *               preferences:
 *                 type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.patch('/me', 
    validateRequest(updateUserSchema), 
    userController.updateUser
);

/**
 * @swagger
 * /users/me/photo:
 *   patch:
 *     summary: Update profile picture
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 */
router.patch('/me/photo', upload.single('file'), userController.updateProfilePicture);

/**
 * @swagger
 * /users/me/cover:
 *   patch:
 *     summary: Update cover photo
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 */
router.patch('/me/cover', upload.single('file'), userController.updateCoverPhoto);

/**
 * @swagger
 * /users/me/gallery:
 *   post:
 *     summary: Add asset to gallery
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 */
router.post('/me/gallery', upload.single('file'), userController.addGalleryAsset);

/**
 * @swagger
 * /users/me/gallery:
 *   delete:
 *     summary: Remove asset from gallery
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assetUrl:
 *                 type: string
 */
router.delete('/me/gallery', userController.deleteGalleryAsset);

/**
 * @swagger
 * /users/{id}/deactivate:
 *   patch:
 *     summary: Deactivate user account (Soft delete)
 *     tags: [Users]
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
 *         description: User deactivated
 */
router.patch('/:id/deactivate', userController.deactivateUser);

/**
 * @swagger
 * /users/{id}/disable:
 *   patch:
 *     summary: Disable user account (Admin)
 *     tags: [Users]
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
 *         description: User disabled
 */
router.patch('/:id/disable', userController.disableUser);

/**
 * @swagger
 * /users/{id}/activate:
 *   patch:
 *     summary: Activate user account (Admin)
 *     tags: [Users]
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
 *         description: User activated
 */
router.patch('/:id/activate', userController.activateUser);

export default router;
