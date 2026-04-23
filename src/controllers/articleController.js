import articleSvc from '../services/articleService.js';
import * as jobService from '../services/jobService.js';
import logger from '../utils/logger.js';

/**
 * Create a new article
 */
export async function createArticle(req, res) {
    try {
        const { uid } = req.user;
        const articleData = req.body;

        const article = await articleSvc.createArticle(uid, articleData);

        res.status(201).json({
            success: true,
            data: article
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
}

/**
 * Get article by slug
 */
export async function getArticle(req, res) {
    try {
        const { slug } = req.params;
        const userId = req.user?.uid || null;

        const article = await articleSvc.getArticleBySlug(slug, userId);

        res.json({
            success: true,
            data: article
        });
    } catch (error) {
        if (error.message.includes('Access denied')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        res.status(404).json({ success: false, error: error.message });
    }
}

/**
 * Update article
 */
export async function updateArticle(req, res) {
    try {
        const { id } = req.params;
        const { uid } = req.user;
        const updates = req.body;

        const updatedArticle = await articleSvc.updateArticle(id, uid, updates);

        res.json({
            success: true,
            data: updatedArticle
        });
    } catch (error) {
        if (error.message === 'Unauthorized') {
            return res.status(403).json({ success: false, error: error.message });
        }
        res.status(400).json({ success: false, error: error.message });
    }
}

/**
 * Regenerate background image
 */
export async function regenerateBackgroundImage(req, res) {
    try {
        const { id } = req.params;
        const { uid } = req.user;
        const { prompt } = req.body;

        const jobData = {
            articleId: id,
            prompt: prompt || ''
        };

        const article = await articleSvc.getArticleById(id);
        if (article.authorId !== uid) {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

        const job = await jobService.addJob('regenerate-background-image', jobData, uid);

        res.status(202).json({
            success: true,
            data: {
                jobId: job.id,
                status: 'queued',
                message: 'Background image regeneration job queued successfully'
            }
        });
    } catch (error) {
        if (error.message === 'Unauthorized') {
            return res.status(403).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: error.message });
    }
}

/**
 * List articles
 */
export async function listArticles(req, res) {
    try {
        const { limit, skip, sort, ...filters } = req.query;
        
        const options = {
            limit: limit ? parseInt(limit) : 20,
            skip: skip ? parseInt(skip) : 0,
            sort: sort || { createdAt: -1 }
        };

        if (typeof articleSvc.listArticles !== 'function') {
            throw new Error(`articleSvc.listArticles is not a function. Available keys: ${Object.keys(articleSvc).join(', ')}`);
        }

        const articles = await articleSvc.listArticles(filters, options);

        res.json({
            success: true,
            data: articles
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

/**
 * Add a review
 */
export async function addReview(req, res) {
    try {
        const { id } = req.params;
        const { uid } = req.user;
        const reviewData = req.body;

        const review = await articleSvc.addReview(id, uid, reviewData);

        res.status(201).json({
            success: true,
            data: review
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
}

/**
 * Generate an article using AI
 */
export async function generateArticle(req, res) {
    try {
        const { uid } = req.user;
        const { topic, depth, instructions, templateId } = req.body;

        if (!topic) {
            return res.status(400).json({ success: false, error: 'Topic is required' });
        }

        const article = await articleSvc.generateArticleContent(uid, topic, depth, instructions, templateId);

        res.status(201).json({
            success: true,
            data: article
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

/**
 * Publish article
 */
export async function publishArticle(req, res) {
    try {
        const { id } = req.params;
        const { uid } = req.user;

        const article = await articleSvc.publishArticle(id, uid);

        res.json({
            success: true,
            data: article,
            message: 'Article published successfully'
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
}

/**
 * Delete article
 */
export async function deleteArticle(req, res) {
    try {
        const { id } = req.params;
        const { uid } = req.user;

        await articleSvc.deleteArticle(id, uid);

        res.json({
            success: true,
            message: 'Article deleted successfully'
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
}

/**
 * Delete all articles
 */
export async function deleteAllArticles(req, res) {
    try {
        const { uid } = req.user;
        const deletedCount = await articleSvc.deleteAllArticles(uid);

        res.json({
            success: true,
            message: `Successfully deleted ${deletedCount} articles`
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

/**
 * Get article by ID
 */
export async function getArticleById(req, res) {
    try {
        const { id } = req.params;
        const article = await articleSvc.getArticleById(id);

        res.json({
            success: true,
            data: article
        });
    } catch (error) {
        res.status(404).json({ success: false, error: error.message });
    }
}
