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
                baseURL: "https://api.linkedin.com/v2",
                headers: {
                    Authorization: `Bearer ${config.accessToken}`,
                    "cache-control": "no-cache",
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

    /**
     * Share content to LinkedIn or fetch profile data
     * @param {Object} options
     * @param {string} options.action - 'sync_profile' or null (for posting)
     */
    async sync(options = {}) {
        try {
            if (!this.client) throw new Error("Not connected to LinkedIn");

            const { action, text, url, title, personUrn = this.config.personUrn } = options;

            if (action === 'sync_profile') {
                const { data: profile } = await axios.get("https://api.linkedin.com/v2/userinfo", {
                    headers: { Authorization: `Bearer ${this.config.accessToken}` }
                });

                let headline = "";

                try {
                    const { data: me } = await this.client.get("/me?projection=(headline,summary)");
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

            const postData = {
                author: personUrn,
                lifecycleState: "PUBLISHED",
                specificContent: {
                    "com.linkedin.ugc.ShareContent": {
                        shareCommentary: {
                            text: text
                        },
                        shareMediaCategory: url ? "ARTICLE" : "NONE"
                    }
                },
                visibility: {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                }
            };

            if (url) {
                postData.specificContent["com.linkedin.ugc.ShareContent"].media = [
                    {
                        status: "READY",
                        description: {
                            text: text.substring(0, 200)
                        },
                        originalUrl: url,
                        title: {
                            text: title || "New Content from TaughtCode"
                        }
                    }
                ];
            }

            const { data } = await this.client.post("/ugcPosts", postData);
            return data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            throw new Error(`LinkedIn Post Error: ${message}`);
        }
    }
}

export default LinkedInIntegrationProvider;
