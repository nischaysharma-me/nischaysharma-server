import { Article, User, Review, Tag, ArticleTemplate } from '../models/index.js';
import logger from '../utils/logger.js';
import * as aiService from './aiService.js';
import * as storageService from './storageService.js';
import * as templateService from './articleTemplateService.js';
import { generateStructurePrompt, generateContentPrompt } from '../prompts/articlePrompts.js';
import { minifyHTML } from '../utils/htmlMinifier.js';
import fetch from 'node-fetch';

/**
 * Generate a background image for an article
 * @param {string} authorId - The ID of the article author
 * @param {string} topic - The topic/title of the article
 * @param {string|null} templateId - Optional template ID
 * @returns {Promise<string>} The URL of the generated background image
 */
async function generateBackgroundImage(authorId, topic, templateId = null) {
    let backgroundImageUrl = '';
    try {
        const bgPrompt = templateId
            ? `A beautiful cover image for an article about ${topic} based on a template. Make it look like a high-quality cover image with NO TEXT or words.`
            : `A high-quality, professional cover image for an article about ${topic}. Ensure there is NO TEXT, typography, or words anywhere in the image.`;

        const bgResult = await aiService.generateImage(bgPrompt, {
            aspectRatio: '16:9',
            imageSize: '2K'
        });

        if (bgResult.success && bgResult.images.length > 0) {
            const imgPart = bgResult.images[0];
            let buffer, mimeType;

            if (typeof imgPart === 'string') {
                const response = await fetch(imgPart);
                const arrayBuffer = await response.arrayBuffer();
                buffer = Buffer.from(arrayBuffer);
                mimeType = response.headers.get('content-type') || 'image/png';
            } else if (imgPart.inlineData) {
                buffer = Buffer.from(imgPart.inlineData.data, 'base64');
                mimeType = imgPart.inlineData.mimeType;
            }

            if (buffer) {
                const uploadResult = await storageService.uploadUserAsset(
                    authorId,
                    buffer,
                    mimeType,
                    'background_images'
                );

                backgroundImageUrl = uploadResult.url;
            }
        }
    } catch (err) {
        logger.warn(`Failed to generate/upload background image for topic "${topic}":`, err);
    }

    return backgroundImageUrl;
}

/**
 * Publish an article
 * @param {string} id
 * @param {string} authorId
 */
async function publishArticle(id, authorId) {
    const article = await Article.findById(id);
    if (!article) throw new Error('Article not found');

    if (article.authorId !== authorId) {
        throw new Error('Unauthorized');
    }

    // Update DB
    const updated = await Article.findByIdAndUpdate(id, {
        status: 'published',
        publishedAt: new Date()
    }, { new: true });

    logger.info(`Article published: ${article.slug}`);
    return updated;
}
/**
 * Generate an article using AI
 * @param {string} authorId
 * @param {string} topic
 * @param {string} depth - 'standard' or 'deep-dive'
 * @param {string} instructions - Optional custom instructions
 * @param {string} templateId - Optional template ID
 */
async function generateArticleContent(authorId, topic, depth = 'standard', instructions = '', templateId = null) {
    logger.info(`ArticleService: Generating article for topic "${topic}" (Depth: ${depth}, Template: ${templateId})`);

    let structure;
    let templateInstructions = '';

    // 0. Auto-generate at least 20 tags
    let generatedTags = [];
    try {
        const tagsResult = await aiService.generateText(`Generate exactly 20 highly relevant SEO and topic tags for an article about "${topic}". Return ONLY a JSON array of strings.`, {
            responseMimeType: 'application/json'
        });
        generatedTags = JSON.parse(tagsResult.text);
        if (!Array.isArray(generatedTags)) {
             generatedTags = [];
        }
    } catch (e) {
        logger.warn(`Failed to generate 20 tags for topic "${topic}":`, e);
    }

    if (templateId) {
        // Use existing template
        const template = await templateService.getTemplate(templateId);
        structure = {
            title: topic, // Use provided topic as title
            description: `Article based on ${template.name}`,
            tags: generatedTags,
            sections: template.structure
        };
        templateInstructions = template.aiInstructions || '';

        // Increment usage
        await templateService.incrementUsage(templateId);
    } else {
        // 1. Generate Structure from scratch
        const structureResult = await aiService.generateText(generateStructurePrompt(topic, depth, instructions), {
            responseMimeType: 'application/json'
        });

        try {
            structure = JSON.parse(structureResult.text);
            // Ensure at least 20 tags are present
            structure.tags = [...new Set([...(structure.tags || []), ...generatedTags])];
        } catch (e) {
            const match = structureResult.text.match(/\{[\s\S]*\}/);
            if (match) {
                structure = JSON.parse(match[0]);
                structure.tags = [...new Set([...(structure.tags || []), ...generatedTags])];
            } else {
                throw new Error("Failed to generate valid article structure");
            }
        }
    }

    // 2. Generate and Upload Images (Same as before)
    const imageUrls = {};
    const imagesAttached = [];
    for (const section of structure.sections) {
        if (section.imagePrompt) {
            try {
                // If using template, imagePrompt might be generic. AI should still handle it.
                // Optionally, we could enhance the prompt by combining topic + template prompt.
                let enhancedPrompt = templateId ? `${section.imagePrompt} related to ${topic}` : section.imagePrompt;
                enhancedPrompt += ". DO NOT include any text, typography, or words in the image.";

                const imageResult = await aiService.generateImage(enhancedPrompt, {
                    aspectRatio: section.imageAspectRatio || '16:9'
                });

                if (imageResult.success && imageResult.images.length > 0) {
                    const imgPart = imageResult.images[0];
                    let buffer, mimeType;

                    if (typeof imgPart === 'string') {
                        const response = await fetch(imgPart);
                        const arrayBuffer = await response.arrayBuffer();
                        buffer = Buffer.from(arrayBuffer);
                        mimeType = response.headers.get('content-type') || 'image/png';
                    } else if (imgPart.inlineData) {
                        buffer = Buffer.from(imgPart.inlineData.data, 'base64');
                        mimeType = imgPart.inlineData.mimeType;
                    }

                    if (buffer) {
                        const uploadResult = await storageService.uploadUserAsset(
                            authorId,
                            buffer,
                            mimeType,
                            'generated_images'
                        );

                        imageUrls[section.heading] = uploadResult.url;
                        imagesAttached.push(uploadResult.url);
                    }
                }
            } catch (err) {
                logger.warn(`Failed to generate/upload image for section "${section.heading}":`, err);
            }
        }
    }

    // 2.5 Generate Background Image
    const backgroundImageUrl = await generateBackgroundImage(authorId, topic, templateId);

    // 3. Generate Full Content
    // Combine custom instructions with template instructions
    const finalInstructions = `${templateInstructions}\n${instructions}`.trim();

    const contentResult = await aiService.generateText(
        generateContentPrompt(structure, imageUrls, depth, finalInstructions),
        { model: 'pro' }
    );
    const content = contentResult.text;

    // 4. Save Article
    const articleData = {
        title: structure.title,
        description: structure.description,
        content: content,
        tags: structure.tags || [],
        status: 'draft',
        access: 'free',
        templateId, // Link to template
        backgroundImage: backgroundImageUrl,
        imagesAttached: imagesAttached
    };

    return await createArticle(authorId, articleData);
}

/**
 * Create a new article
 * @param {string} authorId
 * @param {Object} articleData
 */
async function createArticle(authorId, articleData) {

    // 1. Generate Slug
    let slug = articleData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    // Check for collision and append random suffix if needed
    const existing = await Article.findBySlug(slug);
    if (existing) {
        slug = `${slug}-${Math.random().toString(36).substring(7)}`;
    }

    // 2. Handle Tags
    if (articleData.tags && Array.isArray(articleData.tags)) {
        // Process tags in parallel
        await Promise.all(articleData.tags.map(tagName => Tag.findOrCreate(tagName)));
    }

    const payload = {
        ...articleData,
        authorId,
        slug,
        status: articleData.status || 'draft',
        publishedAt: articleData.status === 'published' ? new Date() : null
    };

    const article = await Article.create(payload);
    logger.info(`Article created: ${article.id} by ${authorId}`);
    return article;
}

/**
 * Add a review to an article
 * @param {string} articleId
 * @param {string} userId
 * @param {Object} reviewData
 */
async function addReview(articleId, userId, reviewData) {
    // Check if article exists
    const article = await Article.findById(articleId);
    if (!article) throw new Error('Article not found');

    // Create review
    const review = await Review.create({
        articleId,
        userId,
        rating: reviewData.rating,
        comment: reviewData.comment
    });

    // Update Article stats
    // Note: In a high-traffic app, this should be an aggregation or cloud function
    const reviews = await Review.findByArticle(articleId);
    const count = reviews.length;
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = count > 0 ? totalRating / count : 0;

    await Article.findByIdAndUpdate(articleId, {
        reviewCount: count,
        averageRating: parseFloat(averageRating.toFixed(1))
    });

    return review;
}

/**
 * Get article by slug (Public/Reader view)
 * Checks access rights based on monetization
 * @param {string} slug
 * @param {string} [userId] - Current user ID (optional for public)
 */
async function getArticleBySlug(slug, userId = null) {
    const article = await Article.findBySlug(slug);
    if (!article) {
        throw new Error('Article not found');
    }

    // If draft, only author can view
    if (article.status !== 'published') {
        if (userId !== article.authorId) {
            throw new Error('Access denied: Article is not published');
        }
        return article;
    }

    // Check Access
    const access = await checkAccess(article, userId);

    if (access.granted) {
        return article;
    } else {
        // Return limited view for locked content
        return {
            id: article.id,
            title: article.title,
            slug: article.slug,
            description: article.description,
            preview: article.preview, // The "teaser"
            access: article.access,
            price: article.price,
            currency: article.currency,
            authorId: article.authorId,
            isLocked: true,
            lockReason: access.reason
        };
    }
}

/**
 * Check if a user has access to an article
 * @param {Object} article
 * @param {string} userId
 */
async function checkAccess(article, userId) {
    // 1. Free Content
    if (article.access === 'free') {
        return { granted: true };
    }

    // 2. Author (Always has access)
    if (userId && article.authorId === userId) {
        return { granted: true };
    }

    // 3. User not logged in (and content is not free)
    if (!userId) {
        return { granted: false, reason: 'login_required' };
    }

    // 4. Paid Single (Pay-Per-View)
    if (article.access === 'paid_single') {
        // TODO: Check if user purchased this specific article
        // const hasPurchased = await Transaction.hasPurchased(userId, article.id);
        const hasPurchased = false; // Mock
        if (hasPurchased) return { granted: true };
        return { granted: false, reason: 'purchase_required' };
    }

    // 5. Author Subscription
    if (article.access === 'subscription_author') {
        // TODO: Check if user subscribes to author
        // const isSubscriber = await Subscription.isSubscribedToAuthor(userId, article.authorId);
        const isSubscriber = false; // Mock
        if (isSubscriber) return { granted: true };
        return { granted: false, reason: 'author_subscription_required' };
    }

    // 6. Platform Subscription
    if (article.access === 'subscription_platform') {
        // TODO: Check user's platform subscription tier
        // const userTier = await User.getSubscriptionTier(userId);
        const userTier = 'free'; // Mock
        // Simple check: if user has any paid tier (assuming 'premium' > 'free')
        if (userTier === 'premium' || userTier === 'pro') return { granted: true };
        return { granted: false, reason: 'platform_subscription_required' };
    }

    return { granted: false, reason: 'unknown_access_type' };
}

/**
 * Get article by ID
 * @param {string} id
 */
async function getArticleById(id) {
    const article = await Article.findById(id);
    if (!article) {
        throw new Error('Article not found');
    }
    return article;
}

/**
 * Update article
 */
async function updateArticle(id, authorId, updates) {
    const article = await Article.findById(id);
    if (!article) throw new Error('Article not found');

    if (article.authorId !== authorId) {
        throw new Error('Unauthorized');
    }

    const updated = await Article.findByIdAndUpdate(id, updates, { new: true });
    return updated;
}

/**
 * Delete article
 */
async function deleteArticle(id, authorId) {
    const article = await Article.findById(id);
    if (!article) throw new Error('Article not found');

    if (article.authorId !== authorId) {
        throw new Error('Unauthorized');
    }

    // Helper to extract storage path from public URL
    const extractPathFromUrl = (url) => {
        try {
            if (!url || !url.includes('storage.googleapis.com')) return null;
            const urlObj = new URL(url);
            const parts = urlObj.pathname.split('/');
            if (parts.length > 2) {
                return parts.slice(2).join('/');
            }
            return null;
        } catch (e) {
            return null;
        }
    };

    // Delete background image
    if (article.backgroundImage) {
        const path = extractPathFromUrl(article.backgroundImage);
        if (path) {
            try {
                await storageService.deleteFile(path);
            } catch (err) {
                logger.warn(`Failed to delete background image for article ${id}: ${err.message}`);
            }
        }
    }

    // Delete attached images
    if (article.imagesAttached && article.imagesAttached.length > 0) {
        for (const url of article.imagesAttached) {
            const path = extractPathFromUrl(url);
            if (path) {
                try {
                    await storageService.deleteFile(path);
                } catch (err) {
                    logger.warn(`Failed to delete attached image ${url} for article ${id}: ${err.message}`);
                }
            }
        }
    }

    const deleted = await Article.findByIdAndDelete(id);
    logger.info(`Article deleted: ${id} by ${authorId}`);
    return deleted;
}

/**
 * Delete all articles for an author
 */
async function deleteAllArticles(authorId) {
    const articles = await Article.find({ authorId });
    let deletedCount = 0;

    for (const article of articles) {
        try {
            await deleteArticle(article.id, authorId);
            deletedCount++;
        } catch (err) {
            logger.warn(`Failed to delete article ${article.id} during bulk delete: ${err.message}`);
        }
    }

    logger.info(`Deleted ${deletedCount} articles for author ${authorId}`);
    return deletedCount;
}

/**
 * List articles (with filters and options)
 */
async function listArticles(filters = {}, options = {}) {
    return await Article.find(filters, options);
}

export {
    generateArticleContent,
    createArticle,
    addReview,
    getArticleBySlug,
    checkAccess,
    getArticleById,
    updateArticle,
    deleteArticle,
    deleteAllArticles,
    listArticles,
    publishArticle,
    generateBackgroundImage
};
