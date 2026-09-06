import * as integrationService from '../services/integrationService.js';
import * as userService from '../services/userProfileService.js';
import * as aiService from '../services/aiService.js';
import logger from '../utils/logger.js';
import Joi from 'joi';
import { parseSlides, renderSlidesPdf } from '../services/socialPostService.js';
import * as storageService from '../services/storageService.js';
import fetch from 'node-fetch';

const socialPostSchema = Joi.object({
    commentary: Joi.string().trim().min(1).max(3000).required(),
    format: Joi.string().valid('text', 'image', 'document').required(),
    title: Joi.string().trim().min(1).max(200).required(),
    url: Joi.string().uri({ scheme: ['http', 'https'] }).allow('').optional(),
    altText: Joi.string().trim().max(300).allow('').optional(),
    slides: Joi.string().allow('').optional(),
    generatedImageUrl: Joi.string().uri({ scheme: ['https'] }).allow('').optional()
});
const LINKEDIN_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif']);
const socialImageSchema = Joi.object({
    title: Joi.string().trim().min(1).max(200).required(),
    description: Joi.string().trim().max(5000).allow('').optional(),
    type: Joi.string().valid('article', 'book').default('article'),
    purpose: Joi.string().valid('post', 'slide').default('post'),
    slideHeadline: Joi.string().trim().max(90).allow('').optional(),
    slideBody: Joi.string().trim().max(420).allow('').optional(),
    imagePrompt: Joi.string().trim().max(1000).allow('').optional(),
    sourceContent: Joi.string().trim().max(30000).allow('').optional()
});

async function downloadGeneratedLinkedInImage(url) {
    const parsed = new URL(url);
    const bucketPrefix = '/nischaysharma-com.firebasestorage.app/users/';
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'storage.googleapis.com' || !parsed.pathname.startsWith(bucketPrefix)) {
        throw new Error('Generated image URL is not from the configured storage bucket');
    }

    const response = await fetch(parsed.toString());
    if (!response.ok) throw new Error('The generated image could not be downloaded');
    const mimeType = response.headers.get('content-type') || 'image/jpeg';
    if (!LINKEDIN_IMAGE_TYPES.has(mimeType)) throw new Error('Generated image has an unsupported format');
    return { buffer: Buffer.from(await response.arrayBuffer()), mimeType };
}

/**
 * Get user Doc ID from request context
 */
async function getUserId(req) {
    // We always want the Firestore Document ID, not the Firebase UID
    const profile = await userService.getUser(req.user.uid);
    return profile?.id;
}

/**
 * Update dynamic integration (e.g. GitHub)
 */
export async function updateIntegration(req, res) {
    try {
        const { provider } = req.params;
        const config = req.body;
        const userId = await getUserId(req);

        if (!userId) throw new Error('User profile not found');

        const updated = await integrationService.updateIntegration(userId, provider, config);
        res.json({ success: true, data: updated });
    } catch (error) {
        logger.error(`IntegrationController: Error updating ${req.params.provider}:`, error);
        res.status(400).json({ 
            success: false, 
            error: error.message,
            details: `Failed to update ${req.params.provider} for user ${userId || 'unknown'}`
        });
    }
}

/**
 * Sync data from an integration
 */
export async function syncIntegration(req, res) {
    try {
        const { provider } = req.params;
        const syncOptions = req.body;
        const userId = await getUserId(req);

        if (!userId) throw new Error('User profile not found');

        const data = await integrationService.syncIntegration(userId, provider, syncOptions);
        res.json({ success: true, data });
    } catch (error) {
        logger.error(`IntegrationController: Error syncing ${req.params.provider}:`, error);
        res.status(400).json({ 
            success: false, 
            error: error.message,
            details: `Failed to sync ${req.params.provider} for user ${userId || 'unknown'}. Ensure the integration is fully connected.`
        });
    }
}

/**
 * Remove an integration
 */
export async function removeIntegration(req, res) {
    try {
        const { provider } = req.params;
        const userId = await getUserId(req);

        if (!userId) throw new Error('User profile not found');

        const updated = await integrationService.removeIntegration(userId, provider);
        res.json({ success: true, data: updated });
    } catch (error) {
        logger.error(`IntegrationController: Error removing ${req.params.provider}:`, error);
        res.status(400).json({ success: false, error: error.message });
    }
}

/**
 * List all integrations for the current user
 */
export async function listIntegrations(req, res) {
    try {
        const userId = await getUserId(req);
        if (!userId) {
            // New user without profile doc yet
            return res.json({ success: true, data: {} });
        }

        const integrations = await integrationService.listIntegrations(userId);
        res.json({ success: true, data: integrations });
    } catch (error) {
        // If it's just "User not found" from the service, return empty integrations
        if (error.message.includes('not found')) {
            return res.json({ success: true, data: {} });
        }
        res.status(400).json({ success: false, error: error.message });
    }
}

/**
 * Initiate OAuth Flow
 */
export async function initiateAuth(req, res) {
    try {
        const { provider } = req.params;
        const userId = await getUserId(req);
        if (!userId) throw new Error('User profile not found');

        // Use user uid as state for simplicity in this dev environment
        const state = req.user.uid; 
        
        const authUrl = await integrationService.getAuthUrl(userId, provider, state);
        res.json({ success: true, authUrl });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
}

/**
 * Generate a social post using AI
 */
export async function generateSocialPost(req, res) {
    try {
        const { title, description, type, format, sourceContent } = req.body;
        
        if (!title) {
            return res.status(400).json({ success: false, error: 'Title is required' });
        }

        const post = await aiService.generateSocialPost({ title, description, type, format, sourceContent });
        
        res.json({ success: true, data: post });
    } catch (error) {
        logger.error('IntegrationController: AI Post Generation Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

/**
 * Generate and persist a LinkedIn-ready image so the browser receives a small,
 * publishable URL instead of a large base64 response.
 */
export async function generateSocialPostImage(req, res) {
    try {
        const { error, value } = socialImageSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            return res.status(400).json({
                success: false,
                error: error.details.map((detail) => detail.message).join(', ')
            });
        }

        const userId = await getUserId(req);
        if (!userId) throw new Error('User profile not found');

        const result = await aiService.generateSocialPostImage(value);
        if (!result.success || !result.images?.length) {
            throw new Error(result.error || 'The image model did not return an image');
        }

        const image = result.images[0];
        let buffer;
        let mimeType;
        if (typeof image === 'string') {
            const response = await fetch(image);
            if (!response.ok) throw new Error('Could not download the generated image');
            buffer = Buffer.from(await response.arrayBuffer());
            mimeType = response.headers.get('content-type') || 'image/png';
        } else if (image.inlineData?.data) {
            buffer = Buffer.from(image.inlineData.data, 'base64');
            mimeType = image.inlineData.mimeType || 'image/png';
        } else {
            throw new Error('The image model returned an unsupported image format');
        }

        const upload = await storageService.uploadUserAsset(
            userId,
            buffer,
            mimeType,
            'linkedin_images'
        );

        res.json({ success: true, data: { url: upload.url, mimeType } });
    } catch (error) {
        logger.error('IntegrationController: LinkedIn Image Generation Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

/**
 * Render optional slide media and publish a rich LinkedIn post.
 */
export async function publishLinkedInPost(req, res) {
    try {
        const { error, value } = socialPostSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            return res.status(400).json({
                success: false,
                error: error.details.map((detail) => detail.message).join(', ')
            });
        }

        const userId = await getUserId(req);
        if (!userId) throw new Error('User profile not found');

        let mediaBuffer = null;
        let mediaType = null;
        if (value.format === 'image') {
            const imageFile = req.files?.media?.[0];
            if (!imageFile && !value.generatedImageUrl) {
                return res.status(400).json({ success: false, error: 'Choose an image before publishing' });
            }
            if (imageFile && !LINKEDIN_IMAGE_TYPES.has(imageFile.mimetype)) {
                return res.status(400).json({ success: false, error: 'LinkedIn image posts support JPG, PNG, and GIF files' });
            }
            if (imageFile) {
                mediaBuffer = imageFile.buffer;
                mediaType = imageFile.mimetype;
            } else {
                const generatedImage = await downloadGeneratedLinkedInImage(value.generatedImageUrl);
                mediaBuffer = generatedImage.buffer;
                mediaType = generatedImage.mimeType;
            }
        } else if (value.format === 'document') {
            const slides = parseSlides(value.slides);
            const imageIndexes = parseSlides(req.body.slideImageIndexes || '[]');
            const slideImages = [];
            (req.files?.slideImages || []).forEach((file, fileIndex) => {
                if (file.mimetype !== 'image/jpeg') {
                    throw new Error('Slide images must be JPEG files');
                }
                const slideIndex = Number(imageIndexes[fileIndex]);
                if (Number.isInteger(slideIndex) && slideIndex >= 0 && slideIndex < slides.length) {
                    slideImages[slideIndex] = file.buffer;
                }
            });
            await Promise.all(slides.map(async (slide, slideIndex) => {
                if (!slideImages[slideIndex] && slide?.imageUrl) {
                    const generatedImage = await downloadGeneratedLinkedInImage(slide.imageUrl);
                    slideImages[slideIndex] = generatedImage.buffer;
                }
            }));
            mediaBuffer = renderSlidesPdf(slides, slideImages);
            mediaType = 'application/pdf';
        }

        const data = await integrationService.syncIntegration(userId, 'linkedin', {
            commentary: value.commentary,
            text: value.commentary,
            format: value.format,
            title: value.title,
            url: value.url || undefined,
            altText: value.altText || undefined,
            mediaBuffer,
            mediaType
        });

        res.json({ success: true, data });
    } catch (error) {
        logger.error('IntegrationController: LinkedIn publish error:', error);
        const requiresReconnect = error.message.includes('Reconnect LinkedIn');
        res.status(requiresReconnect ? 401 : 400).json({
            success: false,
            error: error.message,
            code: requiresReconnect ? 'LINKEDIN_REAUTH_REQUIRED' : undefined
        });
    }
}

/**
 * Handle OAuth Callback
 */
export async function handleCallback(req, res) {
    try {
        const { provider } = req.params;
        const { code, state, error, error_description } = req.query;
        
        // Handle provider errors (e.g. user cancelled)
        if (error) {
            throw new Error(error_description || error);
        }

        if (!code) throw new Error('No authorization code provided');
        
        // In a real app, validate state matches user session
        // Here we assume state is the userId/uid
        const userId = await userService.getUser(state).then(u => u?.id);
        
        if (!userId) throw new Error('Invalid state or user not found');

        const accountInfo = await integrationService.handleCallback(provider, code, userId);
        
        // Redirect back to client settings page
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        res.redirect(`${clientUrl}/admin/profile?integration_success=${provider}`);
    } catch (error) {
        logger.error(`IntegrationController: OAuth Callback Error [${req.params.provider}]:`, error);
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        // URL encode the error message to ensure safe redirect
        const encodedError = encodeURIComponent(error.message);
        res.redirect(`${clientUrl}/admin/profile?integration_error=${encodedError}`);
    }
}
