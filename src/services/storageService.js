import { StorageProvider } from '../providers/storage/registry.js';
import logger from '../utils/logger.js';

const provider = StorageProvider('firebase');

/**
 * Upload a user-specific asset
 * Stores in: users/{userId}/{folder}/{filename}
 * @param {string} userId 
 * @param {Buffer} fileBuffer 
 * @param {string} mimeType 
 * @param {string} type - e.g., 'profile', 'blogs', 'attachments'
 * @param {string} [filename] - Optional custom filename
 */
async function uploadUserAsset(userId, fileBuffer, mimeType, type = 'general', filename = null) {
    const ext = mimeType.split('/')[1] || 'bin';
    const finalFilename = filename || `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    const destination = `users/${userId}/${type}/${finalFilename}`;

    logger.info(`StorageService: Uploading ${type} for user ${userId}`);

    return await provider.upload(fileBuffer, destination, {
        mimeType: mimeType,
        isPublic: true,
        metadata: { userId, type }
    });
}

/**
 * Delete a specific file
 * @param {string} path 
 */
async function deleteFile(path) {
    logger.info(`StorageService: Deleting file at ${path}`);
    return await provider.delete(path);
}

export {
    uploadUserAsset,
    deleteFile
};