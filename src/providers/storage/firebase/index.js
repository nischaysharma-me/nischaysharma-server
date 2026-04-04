import BaseStorageProvider from '../base.js';
import { admin } from '../../../config/firebase.js';

class FirebaseStorageProvider extends BaseStorageProvider {
    constructor() {
        super();
        // Use configured bucket or fall back to default
        // this.bucketName = process.env.FIREBASE_STORAGE_BUCKET || undefined; 
        this.bucket = admin.storage().bucket();
    }

    /**
     * Upload a file to Firebase Storage
     * @param {Buffer} fileBuffer - The file content
     * @param {string} destination - Path in storage (e.g. 'uploads/image.png')
     * @param {Object} options - Metadata { mimeType, isPublic, metadata }
     */
    async upload(fileBuffer, destination, options = {}) {
        try {
            const file = this.bucket.file(destination);

            const metadata = {
                contentType: options.mimeType,
                metadata: options.metadata || {}
            };

            await file.save(fileBuffer, {
                metadata: metadata,
                public: options.isPublic || false,
                resumable: false // Simple upload for now
            });

            // Get public URL if public, otherwise just return path info
            let publicUrl = null;
            if (options.isPublic) {
                publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${destination}`;
            }

            return {
                success: true,
                path: destination,
                url: publicUrl,
                bucket: this.bucket.name,
                metadata: metadata
            };

        } catch (error) {
            throw new Error(`Firebase Storage Upload Error: ${error.message}`);
        }
    }

    /**
     * Download a file
     * @param {string} path 
     */
    async download(path) {
        try {
            const file = this.bucket.file(path);
            const [buffer] = await file.download();
            return buffer;
        } catch (error) {
            throw new Error(`Firebase Storage Download Error: ${error.message}`);
        }
    }

    /**
     * Delete a file
     * @param {string} path 
     */
    async delete(path) {
        try {
            const file = this.bucket.file(path);
            await file.delete();
            return true;
        } catch (error) {
            // Ignore if file doesn't exist
            if (error.code === 404) return true;
            throw new Error(`Firebase Storage Delete Error: ${error.message}`);
        }
    }

    /**
     * Get a signed URL for temporary access
     * @param {string} path 
     * @param {Object} options 
     */
    async getSignedUrl(path, options = {}) {
        try {
            const file = this.bucket.file(path);
            const [url] = await file.getSignedUrl({
                version: 'v4',
                action: options.action || 'read',
                expires: options.expires || Date.now() + 15 * 60 * 1000, // 15 minutes default
            });
            return url;
        } catch (error) {
            throw new Error(`Firebase Storage Signed URL Error: ${error.message}`);
        }
    }
}

export default FirebaseStorageProvider;
