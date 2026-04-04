import * as integrationService from '../services/integrationService.js';
import * as userService from '../services/userProfileService.js';
import * as aiService from '../services/aiService.js';
import logger from '../utils/logger.js';

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
        res.status(400).json({ success: false, error: error.message });
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
        res.status(400).json({ success: false, error: error.message });
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
        const { title, description, type } = req.body;
        
        if (!title) {
            return res.status(400).json({ success: false, error: 'Title is required' });
        }

        const post = await aiService.generateSocialPost({ title, description, type });
        
        res.json({ success: true, data: post });
    } catch (error) {
        logger.error('IntegrationController: AI Post Generation Error:', error);
        res.status(500).json({ success: false, error: error.message });
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
