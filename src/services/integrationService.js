import { User, Integration } from '../models/index.js';
import logger from '../utils/logger.js';
import { IntegrationProvider } from '../providers/integrations/registry.js';
import { INTEGRATIONS_CONFIG } from '../config/integrations.js';
import * as githubUtils from '../utils/githubAnalytics.js';
import * as linkedinUtils from '../utils/linkedinAnalytics.js';
import axios from 'axios';
import { raw } from 'express';

const LINKEDIN_RECONNECT_MESSAGE = 'LinkedIn authorization expired. Reconnect LinkedIn and try publishing again.';

function toMilliseconds(value) {
    if (!value) return null;
    if (typeof value.toMillis === 'function') return value.toMillis();
    if (value instanceof Date) return value.getTime();
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? null : parsed;
}

function isLinkedInAuthError(error) {
    const status = error.response?.status;
    const message = `${error.response?.data?.message || ''} ${error.message || ''}`.toLowerCase();
    return status === 401 || message.includes('token used in the request has expired') || message.includes('invalid access token');
}

function linkedinTokenNeedsRefresh(config) {
    const expiresAt = toMilliseconds(config?.accessTokenExpiresAt);
    return Boolean(expiresAt && expiresAt <= Date.now() + 60_000);
}

async function flagLinkedInReconnect(userId) {
    await updateIntegration(userId, 'linkedin', {
        connected: false,
        requiresReconnect: true
    }, { skipValidation: true });
}

async function refreshLinkedInToken(userId, currentConfig) {
    if (!currentConfig.refreshToken) throw new Error(LINKEDIN_RECONNECT_MESSAGE);

    const appConfig = await getConfigForUser(userId, 'linkedin');
    const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: currentConfig.refreshToken,
        client_id: appConfig.clientId,
        client_secret: appConfig.clientSecret
    }).toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const now = Date.now();
    const refreshed = {
        accessToken: response.data.access_token,
        expiresIn: response.data.expires_in,
        accessTokenExpiresAt: new Date(now + response.data.expires_in * 1000),
        refreshToken: response.data.refresh_token || currentConfig.refreshToken,
        refreshTokenExpiresIn: response.data.refresh_token_expires_in || currentConfig.refreshTokenExpiresIn,
        connected: true,
        requiresReconnect: false
    };
    if (response.data.refresh_token_expires_in) {
        refreshed.refreshTokenExpiresAt = new Date(now + response.data.refresh_token_expires_in * 1000);
    }

    await updateIntegration(userId, 'linkedin', refreshed, { skipValidation: true });
    return { ...currentConfig, ...refreshed };
}

/**
 * Get the integration config for a user, combining defaults with user overrides
 */
export async function getConfigForUser(userId, providerName) {
    let integrationDoc = await Integration.findOne({ userId });
    
    // Check if we need to migrate or initialize
    if (!integrationDoc) {
        const profile = await User.findById(userId);
        if (profile?.integrations?.[providerName]) {
            integrationDoc = await Integration.create({ userId, ...profile.integrations });
        }
    }
    
    const userConfig = integrationDoc?.[providerName] || {};
    const defaultConfig = INTEGRATIONS_CONFIG[providerName] || {};

    logger.debug(`IntegrationService: Resolving config for ${providerName} (User: ${userId})`, { 
        hasUserClientId: !!userConfig.clientId, 
        hasDefaultClientId: !!defaultConfig.clientId 
    });

    return {
        clientId: userConfig.clientId || defaultConfig.clientId,
        clientSecret: userConfig.clientSecret || defaultConfig.clientSecret,
        redirectUri: userConfig.redirectUri || defaultConfig.redirectUri,
        scopes: defaultConfig.scopes || []
    };
}

/**
 * Generate OAuth Authorization URL
 */
export async function getAuthUrl(userId, providerName, state) {
    const config = await getConfigForUser(userId, providerName);
    if (!config.clientId) throw new Error(`Provider ${providerName} is not configured (missing Client ID)`);

    if (providerName === 'github') {
        return `https://github.com/login/oauth/authorize?client_id=${config.clientId}&redirect_uri=${config.redirectUri}&scope=${config.scopes.join(' ')}&state=${state}`;
    } else if (providerName === 'linkedin') {
        return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${config.clientId}&redirect_uri=${config.redirectUri}&scope=${config.scopes.join(' ')}&state=${state}`;
    }
    
    throw new Error(`Unsupported OAuth provider: ${providerName}`);
}

/**
 * Handle OAuth Callback and exchange code for token
 */
export async function handleCallback(providerName, code, userId) {
    const config = await getConfigForUser(userId, providerName);
    if (!config.clientId || !config.clientSecret) {
        throw new Error(`Provider ${providerName} is not fully configured (missing Client ID or Secret)`);
    }

    let tokenData;

    if (providerName === 'github') {
        const response = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: config.clientId,
            client_secret: config.clientSecret,
            code,
            redirect_uri: config.redirectUri
        }, {
            headers: { Accept: 'application/json' }
        });
        tokenData = { accessToken: response.data.access_token };
    } else if (providerName === 'linkedin') {
        const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            client_id: config.clientId,
            client_secret: config.clientSecret,
            redirect_uri: config.redirectUri
        }).toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        const now = Date.now();
        tokenData = {
            accessToken: response.data.access_token,
            expiresIn: response.data.expires_in,
            accessTokenExpiresAt: new Date(now + response.data.expires_in * 1000),
            refreshToken: response.data.refresh_token || null,
            refreshTokenExpiresIn: response.data.refresh_token_expires_in || null,
            refreshTokenExpiresAt: response.data.refresh_token_expires_in
                ? new Date(now + response.data.refresh_token_expires_in * 1000)
                : null,
            requiresReconnect: false
        };
    }

    if (!tokenData?.accessToken) {
        throw new Error(`Failed to obtain access token from ${providerName}`);
    }

    // Connect and get account info
    const provider = IntegrationProvider(providerName, tokenData);
    const accountInfo = await provider.connect();

    // Store in user profile
    await updateIntegration(userId, providerName, {
        ...tokenData,
        ...accountInfo,
        connected: true
    }, { skipValidation: true });

    return accountInfo;
}

/**
 * Update user integration settings (e.g., GitHub)
 * @param {string} userId - User Doc ID
 * @param {string} providerName - 'github', etc.
 * @param {Object} config - Connection config or metadata
 * @param {Object} options - Update options (e.g., skipValidation)
 */
export async function updateIntegration(userId, providerName, config, options = {}) {
    let integrationDoc = await Integration.findOne({ userId });
    if (!integrationDoc) {
        integrationDoc = await Integration.create({ userId });
    }

    const existingConfig = integrationDoc[providerName] || {};
    
    // Merge new config with existing to preserve keys (ClientId, Secret)
    const mergedConfig = { ...existingConfig, ...config };
    
    // If we have an access token and aren't skipping validation
    if (mergedConfig.accessToken && !options.skipValidation) {
        const provider = IntegrationProvider(providerName, mergedConfig);
        const validation = await provider.connect();

        if (!validation.success) {
            throw new Error(`Failed to connect to ${providerName}`);
        }

        integrationDoc[providerName] = {
            ...mergedConfig,
            connected: true,
            accountName: validation.accountName || validation.user || validation.name || validation.urn,
            personUrn: validation.personUrn || validation.urn || null,
            connectedAt: integrationDoc[providerName]?.connectedAt || new Date(),
            updatedAt: new Date()
        };
    } else {
        // Just update configuration (keys) or metadata
        integrationDoc[providerName] = {
            ...mergedConfig,
            // If accessToken was provided but validation was skipped, assume connected
            connected: Object.prototype.hasOwnProperty.call(config, 'connected')
                ? Boolean(config.connected)
                : mergedConfig.accessToken ? true : !!mergedConfig.connected,
            updatedAt: new Date()
        };
        
        // If we are saving connections from handleCallback, we want to normalize fields too
        if (config.accountName || config.urn || config.personUrn) {
            integrationDoc[providerName].accountName = config.accountName || mergedConfig.accountName;
            integrationDoc[providerName].personUrn = config.personUrn || config.urn || mergedConfig.personUrn;
        }
    }
 
    const updateData = {
        [providerName]: integrationDoc[providerName],
        updatedAt: new Date()
    };

    const updatedDoc = await Integration.findByIdAndUpdate(integrationDoc.id, updateData, { new: true });
    logger.info(`IntegrationService: User ${userId} updated integration: ${providerName}`);
    
    return updatedDoc;
}

/**
 * Get configured integration for a user
 * @param {string} userId 
 * @param {string} providerName 
 */
export async function getIntegration(userId, providerName) {
    let doc = await Integration.findOne({ userId });
    let config = doc ? (doc[providerName] || null) : null;
    
    // Fallback to User profile for legacy data
    if (!config) {
        const profile = await User.findById(userId);
        if (profile?.integrations?.[providerName]) {
            config = profile.integrations[providerName];
        }
    }

    if (config) {
        // Ensure accessToken is normalized (legacy might have snake_case)
        if (!config.accessToken && config.access_token) {
            config.accessToken = config.access_token;
        }
    }
    
    return config;
}

/**
 * Sync data from an integration
 * @param {string} userId 
 * @param {string} providerName 
 * @param {Object} syncOptions 
 */
export async function syncIntegration(userId, providerName, syncOptions = {}) {
    let config = await getIntegration(userId, providerName);
    if (!config) throw new Error(`Integration ${providerName} not configured for this user`);

    let refreshed = false;
    if (providerName === 'linkedin' && linkedinTokenNeedsRefresh(config)) {
        try {
            config = await refreshLinkedInToken(userId, config);
            refreshed = true;
        } catch (error) {
            await flagLinkedInReconnect(userId);
            if (isLinkedInAuthError(error) || error.message === LINKEDIN_RECONNECT_MESSAGE) {
                throw new Error(LINKEDIN_RECONNECT_MESSAGE);
            }
            throw error;
        }
    }

    let provider = IntegrationProvider(providerName, config);
    
    // Ensure we have a client initialized if possible
    if (!provider.client && config.accessToken) {
        provider.client = provider.initializeClient(config.accessToken);
    }

    // Connect first
    try {
        await provider.connect();
    } catch (error) {
        if (providerName !== 'linkedin' || !isLinkedInAuthError(error)) throw error;

        if (config.refreshToken && !refreshed) {
            try {
                config = await refreshLinkedInToken(userId, config);
                provider = IntegrationProvider(providerName, config);
                await provider.connect();
            } catch (refreshError) {
                await flagLinkedInReconnect(userId);
                throw new Error(LINKEDIN_RECONNECT_MESSAGE);
            }
        } else {
            await flagLinkedInReconnect(userId);
            throw new Error(LINKEDIN_RECONNECT_MESSAGE);
        }
    }
    
    // Check for special analytics sync actions
    if (syncOptions.action === 'get_stats' || syncOptions.action === 'sync_profile') {
        return await syncProfileStats(userId, providerName, syncOptions);
    }

    const data = await provider.sync(syncOptions);
    logger.info(`IntegrationService: Synced data for ${providerName} (User: ${userId})`);
    
    return data;
}

/**
 * Perform deep sync of profile statistics and analytics
 */
export async function syncProfileStats(userId, providerName, options = {}) {
    const config = await getIntegration(userId, providerName);
    if (!config) throw new Error(`Integration ${providerName} not configured`);

    const profile = await User.findById(userId);
    const provider = IntegrationProvider(providerName, config);
    
    let processedData = null;

    if (providerName === 'github') {
        const rawStats = await provider.sync({ action: 'get_stats' });
        processedData = {
            username: rawStats.login,
            avatarUrl: rawStats.avatarUrl,
            stats: githubUtils.summarizeProfileStats(rawStats),
            languages: githubUtils.calculateLanguagePercentages(rawStats.repositories.nodes),
            contributionCalendar: githubUtils.processContributionCalendar(rawStats.contributionsCollection.contributionCalendar),
            lastSyncedAt: new Date()
        };
    } else if (providerName === 'linkedin') {
        // LinkedIn might use positions sync or other profile data
        const rawProfile = await provider.sync({ action: 'sync_profile' });
        // logger.log('xvf', rawProfile)
        processedData = {
            memberId: rawProfile.id,
            accountName: `${rawProfile.given_name} ${rawProfile.family_name}`,
            headline: rawProfile.headline,
            summary: rawProfile.summary || "",
            positions: linkedinUtils.formatPositions(rawProfile.positions) || [],
            verifiedSkills: linkedinUtils.extractTopSkills(rawProfile.skills) || [],
            education: linkedinUtils.formatEducation(rawProfile.education) || [],
            lastSyncedAt: new Date()
        };
    }

    if (processedData) {
        const analytics = profile.analytics || {};
        analytics[providerName] = processedData;
        await User.findByIdAndUpdate(userId, { analytics }, { new: true });
        logger.info(`IntegrationService: Updated analytics for ${providerName} (User: ${userId})`);
    }

    return processedData;
}

/**
 * Remove an integration from a user's profile
 * @param {string} userId 
 * @param {string} providerName 
 */
export async function removeIntegration(userId, providerName) {
    const doc = await Integration.findOne({ userId });
    if (!doc) return null;

    const updateData = {
        [providerName]: null,
        updatedAt: new Date()
    };

    const updatedDoc = await Integration.findByIdAndUpdate(doc.id, updateData, { new: true });
    logger.info(`IntegrationService: User ${userId} removed integration: ${providerName}`);
    
    return updatedDoc;
}

/**
 * List all integrations for a user
 * @param {string} userId 
 */
export async function listIntegrations(userId) {
    const doc = await Integration.findOne({ userId });
    if (doc) {
        const { id, userId: _, updatedAt, ...providers } = doc;
        return providers;
    }
    
    // Check user profile for migration
    const profile = await User.findById(userId);
    return profile?.integrations || {};
}
