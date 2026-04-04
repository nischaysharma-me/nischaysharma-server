import dotenv from 'dotenv';
dotenv.config();

export const INTEGRATIONS_CONFIG = {
    github: {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        redirectUri: process.env.GITHUB_REDIRECT_URI || 'http://localhost:3002/api/v1/integrations/github/callback',
        scopes: ['read:user', 'repo']
    },
    linkedin: {
        clientId: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        redirectUri: process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3002/api/v1/integrations/linkedin/callback',
        scopes: ['openid', 'profile', 'email', 'w_member_social']
    }
};
