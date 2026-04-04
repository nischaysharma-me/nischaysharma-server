import * as articleService from '../services/articleService.js';

/**
 * Create a new article
 */
const createArticle = async (req, res) => {
    try {
        const { uid } = req.user;
        const articleData = req.body;

        const article = await articleService.createArticle(uid, articleData);

        res.status(201).json({
            success: true,
            data: article
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

/**
 * Get article by slug
 * Public route (optional auth)
 */
const getArticle = async (req, res) => {
    try {
        const { slug } = req.params;
        const userId = req.user?.uid || null;

        const article = await articleService.getArticleBySlug(slug, userId);

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
};

/**
 * Update article
 */
const updateArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const { uid } = req.user;
        const updates = req.body;

        const updatedArticle = await articleService.updateArticle(id, uid, updates);

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
};

/**
 * List articles
 */
const listArticles = async (req, res) => {
    try {
        const { limit, skip, sort, ...filters } = req.query;
        
        const options = {
            limit: limit ? parseInt(limit) : 20,
            skip: skip ? parseInt(skip) : 0,
            sort: sort || { createdAt: -1 }
        };

        const articles = await articleService.listArticles(filters, options);

        res.json({
            success: true,
            data: articles
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Add a review
 */
const addReview = async (req, res) => {
    try {
        const { id } = req.params; // Article ID
        const { uid } = req.user;
        const reviewData = req.body;

        const review = await articleService.addReview(id, uid, reviewData);

        res.status(201).json({
            success: true,
            data: review
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

/**
 * Generate an article using AI
 */
const generateArticle = async (req, res) => {
    try {
        const { uid } = req.user;
        const { topic, depth, instructions, templateId } = req.body;

        if (!topic) {
            return res.status(400).json({ success: false, error: 'Topic is required' });
        }

        const article = await articleService.generateArticleContent(uid, topic, depth, instructions, templateId);

        res.status(201).json({
            success: true,
            data: article
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Publish article to docs
 */
const publishArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const { uid } = req.user;

        const article = await articleService.publishArticle(id, uid);

        res.json({
            success: true,
            data: article,
            message: 'Article published to documentation'
        });
    } catch (error) {
        if (error.message === 'Unauthorized') {
            return res.status(403).json({ success: false, error: error.message });
        }
        res.status(400).json({ success: false, error: error.message });
    }
};

/**
 * Delete article
 */
const deleteArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const { uid } = req.user;

        await articleService.deleteArticle(id, uid);

        res.json({
            success: true,
            message: 'Article deleted successfully'
        });
    } catch (error) {
        if (error.message === 'Unauthorized') {
            return res.status(403).json({ success: false, error: error.message });
        }
        res.status(400).json({ success: false, error: error.message });
    }
};

/**
 * Delete all articles
 */
const deleteAllArticles = async (req, res) => {
    try {
        const { uid } = req.user;

        const deletedCount = await articleService.deleteAllArticles(uid);

        res.json({
            success: true,
            message: `Successfully deleted ${deletedCount} articles`
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Get article by ID
 * Private route (requires auth)
 */
const getArticleById = async (req, res) => {
    try {
        const { id } = req.params;
        const article = await articleService.getArticleById(id);

        if (article.authorId !== req.user.uid && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

        res.json({
            success: true,
            data: article
        });
    } catch (error) {
        res.status(404).json({ success: false, error: error.message });
    }
};

export {
    createArticle,
    getArticle,
    getArticleById,
    updateArticle,
    listArticles,
    addReview,
    generateArticle,
    publishArticle,
    deleteArticle,
    deleteAllArticles
};
