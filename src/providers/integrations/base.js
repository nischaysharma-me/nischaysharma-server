/**
 * Abstract Base Class for Integration Providers
 * Defines the contract that all third-party integrations must follow.
 */
class BaseIntegrationProvider {
    constructor(config = {}) {
        this.config = config;
    }

    /**
     * Connect to the third-party service
     * @returns {Promise<boolean>} - Success status
     */
    async connect() {
        throw new Error("Method 'connect' must be implemented");
    }

    /**
     * Disconnect from the third-party service
     * @returns {Promise<boolean>} - Success status
     */
    async disconnect() {
        throw new Error("Method 'disconnect' must be implemented");
    }

    /**
     * Validate the integration configuration/credentials
     * @returns {Promise<boolean>} - Validity status
     */
    async validate() {
        throw new Error("Method 'validate' must be implemented");
    }

    /**
     * Sync data between systems
     * @param {Object} options - Sync options
     */
    async sync(options = {}) {
        throw new Error("Method 'sync' must be implemented");
    }
}

export default BaseIntegrationProvider;
