import { ApiKey } from '../models/index.js';
import ApiKeyProvider from '../providers/auth/apiKey.js';

const provider = new ApiKeyProvider();

/**
 * Create a new API Key for an organization
 * @param {string} organizationId 
 * @param {string} userId 
 * @param {string} name 
 * @param {Array} scopes 
 * @returns {Promise<Object>} { plainTextKey, apiKeyRecord }
 */
export const createApiKey = async (organizationId, userId, name, scopes = ['*']) => {
    const { plainTextKey, keyHash, prefix } = provider.generate();

    const apiKeyRecord = await ApiKey.create({
        name,
        keyHash,
        prefix,
        organizationId,
        createdBy: userId,
        scopes,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
    });

    return {
        plainTextKey,
        apiKeyRecord
    };
};

/**
 * Validate an API key and return context
 * @param {string} plainTextKey 
 * @returns {Promise<Object|null>}
 */
export const validateApiKey = async (plainTextKey) => {
    if (!plainTextKey || typeof plainTextKey !== 'string') return null;

    const keyHash = provider.hash(plainTextKey);

    // Find by hash
    const keyRecord = await ApiKey.findOne({ keyHash, status: 'active' });

    if (!keyRecord) return null;

    // Check expiration if set
    if (keyRecord.expiresAt && new Date() > keyRecord.expiresAt) {
        await ApiKey.update(keyRecord.id, { status: 'expired' });
        return null;
    }

    // Update last used
    await ApiKey.update(keyRecord.id, {
        lastUsedAt: new Date(),
        updatedAt: new Date()
    });

    return {
        organizationId: keyRecord.organizationId,
        scopes: keyRecord.scopes,
        keyId: keyRecord.id,
        name: keyRecord.name
    };
};

/**
 * List API keys for an organization
 * @param {string} organizationId 
 */
export const listApiKeys = async (organizationId) => {
    return await ApiKey.find({ organizationId });
};

/**
 * Revoke an API key
 * @param {string} keyId 
 */
export const revokeApiKey = async (keyId) => {
    return await ApiKey.update(keyId, {
        status: 'revoked',
        updatedAt: new Date()
    });
};
