import * as aiService from './aiService.js';
import * as storageService from './storageService.js';
import * as articleService from './articleService.js';
import logger from '../utils/logger.js';
import { Article } from '../models/index.js';
import fetch from 'node-fetch';

/**
 * Generate a new background image for an existing article
 * @param {string} userId - The ID of the user requesting the regeneration
 * @param {Object} data - The job data containing articleId and optional prompt
 * @param {string} data.articleId - The ID of the article to regenerate background image for
 * @param {string} [data.prompt] - Optional custom prompt for image generation
 */
async function regenerateBackgroundImage(userId, data) {
    const { articleId, prompt } = data;

    logger.info(`BackgroundImageService: Regenerating background image for article ${articleId}`);

    // 1. Validate article exists and user has permission
    const article = await Article.findById(articleId);
    logger.info(`Article retrieved: ${JSON.stringify(article)}`);

    if (!article) {
        throw new Error('Article not found');
    }

    if (article.authorId !== userId) {
        throw new Error('Unauthorized: Only article authors can regenerate background images');
    }

    if (!article.title) {
        throw new Error('Article title is missing');
    }

    // 2. Generate Background Image
    let backgroundImageUrl = '';
    try {
        // Use custom prompt if provided, otherwise generate based on article title
        const bgPrompt = prompt && prompt.trim() !== ''
            ? prompt
            : `A beautiful, professional cover image for an article titled "${article.title}". Ensure there is NO TEXT, typography, or words anywhere in the image.`;

        logger.info(`Generating background image with prompt: ${bgPrompt}`);

        // Try up to 3 times to generate an image
        let bgResult;
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            attempts++;
            logger.info(`Attempt ${attempts} to generate background image`);

            bgResult = await aiService.generateImage(bgPrompt, {
                aspectRatio: '16:9',
                imageSize: '2K'
            });

            logger.info(`AI service response: ${JSON.stringify(bgResult)}`);

            if (bgResult.success && bgResult.images && bgResult.images.length > 0) {
                break; // Success, exit the loop
            }

            if (attempts < maxAttempts) {
                // Wait a bit before retrying
                await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
            }
        }

        if (!bgResult.success || !bgResult.images || bgResult.images.length === 0) {
            logger.error(`AI service failed to generate images after ${maxAttempts} attempts. Last response: ${JSON.stringify(bgResult)}`);
            throw new Error(`Failed to generate background image - no images returned from AI service after ${maxAttempts} attempts`);
        }

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
        } else {
            logger.error(`Unexpected image format: ${JSON.stringify(imgPart)}`);
            throw new Error('Unexpected image format returned from AI service');
        }

        if (buffer) {
            const uploadResult = await storageService.uploadUserAsset(
                userId,
                buffer,
                mimeType,
                'background_images'
            );

            backgroundImageUrl = uploadResult.url;
            logger.info(`Background image uploaded successfully: ${backgroundImageUrl}`);
        }
    } catch (err) {
        logger.error(`Failed to generate/upload background image for article ${articleId}:`, err);
        throw new Error(`Failed to generate background image: ${err.message}`);
    }

    // 3. Update article with new background image
    try {
        const updatedArticle = await articleService.updateArticle(articleId, userId, {
            backgroundImage: backgroundImageUrl
        });

        logger.info(`Article ${articleId} background image updated successfully`);
        return updatedArticle;
    } catch (err) {
        logger.error(`Failed to update article ${articleId} with new background image:`, err);
        throw err;
    }
}

export {
    regenerateBackgroundImage
};