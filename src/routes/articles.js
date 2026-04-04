import express from 'express';
import * as articleController from '../controllers/articleController.js';
import * as templateController from '../controllers/articleTemplateController.js';
import { isAuthenticated, optionalAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { enqueueJob } from '../middleware/jobMiddleware.js';
import { createArticleSchema, updateArticleSchema, addReviewSchema, generateArticleSchema, generateTemplateSchema } from '../validation/articleSchemas.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Articles
 *   description: Article management and monetization
 */

// --- Templates ---

/**
 * @swagger
 * /articles/templates/generate:
 *   post:
 *     summary: Generate a reusable article template using AI (Async Job)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       202:
 *         description: Job accepted
 */
router.post('/templates/generate',
    isAuthenticated,
    validateRequest(generateTemplateSchema),
    enqueueJob('template-generation')
);

/**
 * @swagger
 * /articles/templates/config:
 *   get:
 *     summary: Get template configurations and categories
 *     tags: [Articles]
 *     responses:
 *       200:
 *         description: Template configuration data
 */
router.get('/templates/config', templateController.getTemplateConfig);

/**
 * @swagger
 * /articles/templates:
 *   get:
 *     summary: List all article templates
 *     tags: [Articles]
 *     responses:
 *       200:
 *         description: List of templates
 */
router.get('/templates', templateController.listTemplates);

/**
 * @swagger
 * /articles/templates/{slug}:
 *   get:
 *     summary: Get template by slug
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template data
 */
router.get('/templates/:slug', templateController.getTemplateBySlug);


/**
 * @swagger
 * /articles/templates/{id}:
 *   patch:
 *     summary: Update template
 *     tags: [Articles]
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
 *         description: Template updated
 */
router.patch('/templates/:id',
    isAuthenticated,
    templateController.updateTemplate
);

/**
 * @swagger
 * /articles/templates/{id}:
 *   delete:
 *     summary: Delete template
 *     tags: [Articles]
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
 *         description: Template deleted
 */
router.delete('/templates/:id',
    isAuthenticated,
    templateController.deleteTemplate
);

// --- Articles ---

/**
 * @swagger
 * /articles:
 *   post:
 *     summary: Create a new article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ArticleInput'
 *     responses:
 *       201:
 *         description: Article created
 */
router.post('/', 
    isAuthenticated, 
    validateRequest(createArticleSchema), 
    articleController.createArticle
);

/**
 * @swagger
 * /articles/generate:
 *   post:
 *     summary: Generate an article using AI (Async Job)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               topic:
 *                 type: string
 *               depth:
 *                 type: string
 *                 enum: [standard, deep-dive]
 *                 default: standard
 *               instructions:
 *                 type: string
 *                 description: Custom instructions for the AI
 *               templateId:
 *                 type: string
 *                 description: Optional ID of an Article Template to use
 *     responses:
 *       202:
 *         description: Job accepted
 */
router.post('/generate',
    isAuthenticated,
    validateRequest(generateArticleSchema),
    enqueueJob('article-generation')
);

/**
 * @swagger
 * /articles:
 *   get:
 *     summary: List articles
 *     tags: [Articles]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: authorId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of articles
 */
router.get('/', articleController.listArticles);

/**
 * @swagger
 * /articles:
 *   delete:
 *     summary: Delete all articles for the authenticated user
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All articles deleted successfully
 */
router.delete('/',
    isAuthenticated,
    articleController.deleteAllArticles
);

router.get('/fetch/:id',
    isAuthenticated,
    articleController.getArticleById
);

/**
 * @swagger
 * /articles/{slug}:
 *   get:
 *     summary: Get article by slug
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Article data (full or preview)
 */
router.get('/:slug', 
    optionalAuth, 
    articleController.getArticle
);

/**
 * @swagger
 * /articles/{id}:
 *   patch:
 *     summary: Update article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ArticleUpdate'
 *     responses:
 *       200:
 *         description: Article updated
 */
router.patch('/:id', 
    isAuthenticated, 
    validateRequest(updateArticleSchema), 
    articleController.updateArticle
);

/**
 * @swagger
 * /articles/{id}:
 *   delete:
 *     summary: Delete article
 *     tags: [Articles]
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
 *         description: Article deleted
 */
router.delete('/:id',
    isAuthenticated,
    articleController.deleteArticle
);

/**
 * @swagger
 * /articles/{id}/reviews:
 *   post:
 *     summary: Add a review
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review added
 */
router.post('/:id/reviews', 
    isAuthenticated, 
    validateRequest(addReviewSchema), 
    articleController.addReview
);

/**
 * @swagger
 * /articles/{id}/publish:
 *   post:
 *     summary: Publish article to documentation
 *     tags: [Articles]
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
 *         description: Article published
 */
router.post('/:id/publish',
    isAuthenticated,
    articleController.publishArticle
);

export default router;
