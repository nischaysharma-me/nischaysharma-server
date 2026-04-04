import BaseAuthProvider from "./base.js";
import crypto from 'crypto';

class ApiKeyProvider extends BaseAuthProvider {
    constructor() {
        super();
    }

    /**
     * Generate a new API Key
     * Format: tk_{random_chars}
     */
    generate() {
        const prefix = 'tk_';
        const randomPart = crypto.randomBytes(32).toString('hex');
        const plainTextKey = `${prefix}${randomPart}`;
        const keyHash = this.hash(plainTextKey);
        
        return {
            plainTextKey,
            keyHash,
            prefix
        };
    }

    /**
     * Hash the API Key for storage
     * @param {string} key 
     */
    hash(key) {
        return crypto.createHash('sha256').update(key).digest('hex');
    }

    async verifyToken(apiKey) {
        // TODO: Implement actual API key lookup against Organization settings or a dedicated collection
        // For now, allow a dev key or fail
        if (process.env.DEV_API_KEY && apiKey === process.env.DEV_API_KEY) {
            return { uid: 'system', role: 'admin', authType: 'apikey' };
        }
        throw new Error("Invalid API Key");
    }

    async isAuthenticated(apiKey) {
        try {
            await this.verifyToken(apiKey);
            return true;
        } catch (error) {
            return false;
        }
    }
}

export default ApiKeyProvider;
