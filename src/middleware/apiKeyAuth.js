import { validateApiKey } from '../services/apiKeyService.js';
import logger from '../utils/logger.js';

/**
 * Middleware to authenticate requests via API Key
 * Expected header: x-api-key
 */
const apiKeyAuth = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return next(); // Pass through to other auth methods if any
    }

    try {
        const keyContext = await validateApiKey(apiKey);

        if (!keyContext) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or revoked API key'
            });
        }

        // Attach organization context to request
        req.organizationId = keyContext.organizationId;
        req.apiKey = {
            id: keyContext.keyId,
            name: keyContext.name,
            scopes: keyContext.scopes
        };
        req.authType = 'apikey';

        // For API key requests, we don't have a user session, 
        // but some code might expect req.user. We can mock it or handle it in controllers.
        req.user = {
            id: `system_key_${keyContext.keyId}`,
            isSystem: true
        };

        logger.debug(`Authenticated request for org ${keyContext.organizationId} using API key: ${keyContext.name}`);
        next();
    } catch (error) {
        logger.error('API Key validation error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error during authentication'
        });
    }
};

export default apiKeyAuth;
