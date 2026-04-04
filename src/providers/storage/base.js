/**
 * Abstract Base Class for Storage Providers
 * Defines the contract that all storage implementations must follow.
 */
class BaseStorageProvider {
    constructor() {}

    /**
     * Upload a file to storage
     * @param {Buffer|string} file - File content (buffer) or path
     * @param {string} destination - Destination path in storage (e.g., 'users/123/avatar.jpg')
     * @param {Object} options - metadata, mimeType, etc.
     * @returns {Promise<Object>} - Upload result (url, metadata)
     */
    async upload(file, destination, options = {}) {
        throw new Error("Method 'upload' must be implemented");
    }

    /**
     * Download a file from storage
     * @param {string} path - Path to file in storage
     * @returns {Promise<Buffer>} - File content
     */
    async download(path) {
        throw new Error("Method 'download' must be implemented");
    }

    /**
     * Delete a file from storage
     * @param {string} path - Path to file in storage
     * @returns {Promise<boolean>} - Success status
     */
    async delete(path) {
        throw new Error("Method 'delete' must be implemented");
    }

    /**
     * Get a signed URL for temporary access
     * @param {string} path - Path to file
     * @param {Object} options - expiration, action ('read', 'write')
     * @returns {Promise<string>} - Signed URL
     */
    async getSignedUrl(path, options = {}) {
        throw new Error("Method 'getSignedUrl' must be implemented");
    }
}

export default BaseStorageProvider;
