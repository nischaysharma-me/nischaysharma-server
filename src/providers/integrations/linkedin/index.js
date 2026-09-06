import BaseIntegrationProvider from "../base.js";
import axios from "axios";

class LinkedInIntegrationProvider extends BaseIntegrationProvider {
    /**
     * @param {Object} config
     * @param {string} config.accessToken - LinkedIn OAuth Token
     * @param {string} config.personUrn - LinkedIn Member URN (e.g., 'urn:li:person:12345')
     */
    constructor(config) {
        super(config);
        
        if (config?.accessToken) {
            this.client = axios.create({
                baseURL: "https://api.linkedin.com/rest",
                headers: {
                    Authorization: `Bearer ${config.accessToken}`,
                    "cache-control": "no-cache",
                    "Linkedin-Version": process.env.LINKEDIN_API_VERSION || "202604",
                    "X-Restli-Protocol-Version": "2.0.0",
                },
            });
        }
    }

    /**
     * Connect/Validate the LinkedIn connection and get Member URN
     */
    async connect() {
        try {
            if (!this.config?.accessToken) {
                throw new Error("LinkedIn Access Token is required for connection");
            }
            
            let data;
            let memberId;
            let firstName, lastName, accountName, picture;

            try {
                // Try modern OpenID Connect userinfo endpoint (SSID)
                const response = await axios.get("https://api.linkedin.com/v2/userinfo", {
                    headers: {
                        Authorization: `Bearer ${this.config.accessToken}`,
                        Accept: 'application/json'
                    }
                });
                data = response.data;
                memberId = data.sub;
                firstName = data.given_name;
                lastName = data.family_name;
                accountName = `${firstName} ${lastName}`;
                picture = data.picture;
            } catch (oidcError) {
                // Fallback to legacy /v2/me endpoint
                console.warn("LinkedIn: OIDC /v2/userinfo failed, trying legacy /v2/me", oidcError.message);
                const response = await axios.get("https://api.linkedin.com/v2/me", {
                    headers: {
                        Authorization: `Bearer ${this.config.accessToken}`,
                        "X-Restli-Protocol-Version": "2.0.0"
                    }
                });
                data = response.data;
                memberId = data.id;
                firstName = data.localizedFirstName;
                lastName = data.localizedLastName;
                accountName = `${firstName} ${lastName}`;
            }
            
            if (!memberId) throw new Error("Could not retrieve member ID from LinkedIn");

            return {
                success: true,
                urn: `urn:li:person:${memberId}`,
                personUrn: `urn:li:person:${memberId}`,
                firstName,
                lastName,
                accountName,
                picture
            };
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            throw new Error(`LinkedIn Connection Error: ${message}`);
        }
    }

    async validate() {
        try {
            await this.connect();
            return true;
        } catch (error) {
            return false;
        }
    }

    async disconnect() {
        this.client = null;
        return true;
    }

    async initializeUpload(kind, owner) {
        const collection = kind === 'document' ? 'documents' : 'images';
        const { data } = await this.client.post(`/${collection}?action=initializeUpload`, {
            initializeUploadRequest: { owner }
        });
        const value = data?.value;
        const assetUrn = kind === 'document' ? value?.document : value?.image;
        if (!value?.uploadUrl || !assetUrn) {
            throw new Error(`LinkedIn did not return a ${kind} upload URL`);
        }
        return { uploadUrl: value.uploadUrl, assetUrn };
    }

    async uploadBytes(uploadUrl, bytes, contentType) {
        await axios.put(uploadUrl, bytes, {
            headers: {
                Authorization: `Bearer ${this.config.accessToken}`,
                'Content-Type': contentType,
                'Content-Length': bytes.length
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity
        });
    }

    async waitForAsset(kind, assetUrn) {
        const collection = kind === 'document' ? 'documents' : 'images';
        for (let attempt = 0; attempt < 12; attempt += 1) {
            const { data } = await this.client.get(`/${collection}/${encodeURIComponent(assetUrn)}`);
            const status = data?.status || data?.value?.status;
            if (status === 'AVAILABLE') return;
            if (status === 'PROCESSING_FAILED') {
                throw new Error(`LinkedIn failed to process the ${kind}`);
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        throw new Error(`LinkedIn ${kind} processing timed out; please retry`);
    }

    async uploadMedia(kind, bytes, contentType, owner) {
        const upload = await this.initializeUpload(kind, owner);
        await this.uploadBytes(upload.uploadUrl, bytes, contentType);
        await this.waitForAsset(kind, upload.assetUrn);
        return upload.assetUrn;
    }

    async createPost({ author, commentary, content }) {
        const postData = {
            author,
            commentary,
            visibility: 'PUBLIC',
            distribution: {
                feedDistribution: 'MAIN_FEED',
                targetEntities: [],
                thirdPartyDistributionChannels: []
            },
            lifecycleState: 'PUBLISHED',
            isReshareDisabledByAuthor: false
        };
        if (content) postData.content = content;

        const response = await this.client.post('/posts', postData);
        return {
            id: response.headers?.['x-restli-id'] || response.data?.id || null,
            ...response.data
        };
    }

    /**
     * Share content to LinkedIn or fetch profile data
     * @param {Object} options
     * @param {string} options.action - 'sync_profile' or null (for posting)
     */
    async sync(options = {}) {
        try {
            if (!this.client) throw new Error("Not connected to LinkedIn");

            const {
                action,
                text,
                commentary = text,
                url,
                title,
                format = 'text',
                mediaBuffer,
                mediaType,
                altText,
                personUrn = this.config.personUrn
            } = options;

            if (action === 'sync_profile') {
                const { data: profile } = await axios.get("https://api.linkedin.com/v2/userinfo", {
                    headers: { Authorization: `Bearer ${this.config.accessToken}` }
                });

                let headline = "";

                try {
                    const { data: me } = await axios.get("https://api.linkedin.com/v2/me?projection=(headline,summary)", {
                        headers: {
                            Authorization: `Bearer ${this.config.accessToken}`,
                            "X-Restli-Protocol-Version": "2.0.0"
                        }
                    });
                    headline = me.headline?.localized?.[me.headline.preferredLocale?.language + "_" + me.headline.preferredLocale?.country] || "";
                } catch (e) { /* ignore */ }

                return {
                    ...profile,
                    headline,
                    positions: [],
                    skills: []
                };
            }

            // Default behavior: Post content
            if (!personUrn) throw new Error("LinkedIn Person URN is required to post");

            if (!commentary?.trim()) throw new Error('LinkedIn commentary is required');

            let content;
            if (format === 'image') {
                if (!mediaBuffer || !mediaType?.startsWith('image/')) {
                    throw new Error('An image file is required for an image post');
                }
                const imageUrn = await this.uploadMedia('image', mediaBuffer, mediaType, personUrn);
                content = { media: { id: imageUrn, altText: altText || title || 'Post image' } };
            } else if (format === 'document') {
                if (!mediaBuffer || mediaType !== 'application/pdf') {
                    throw new Error('A PDF is required for a document post');
                }
                const documentUrn = await this.uploadMedia('document', mediaBuffer, mediaType, personUrn);
                content = { media: { id: documentUrn, title: title || 'Document' } };
            } else if (url) {
                content = {
                    article: {
                        source: url,
                        title: title || 'New content',
                        description: commentary.slice(0, 200)
                    }
                };
            }

            return await this.createPost({ author: personUrn, commentary, content });
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            throw new Error(`LinkedIn Post Error: ${message}`);
        }
    }
}

export default LinkedInIntegrationProvider;
