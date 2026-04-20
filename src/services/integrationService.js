import { User } from '../models/index.js';
import logger from '../utils/logger.js';
import { IntegrationProvider } from '../providers/integrations/registry.js';
import { INTEGRATIONS_CONFIG } from '../config/integrations.js';
import * as githubUtils from '../utils/githubAnalytics.js';
import * as linkedinUtils from '../utils/linkedinAnalytics.js';
import axios from 'axios';

/**
 * Get the integration config for a user, combining defaults with user overrides
 */
export async function getConfigForUser(userId, providerName) {
    const profile = await User.findById(userId);
    if (!profile) throw new Error('User profile not found');
    
    // Config is stored within the integrations object in the profile
    const userConfig = profile.integrations?.[providerName] || {};
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
        tokenData = { accessToken: response.data.access_token, expiresIn: response.data.expires_in };
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
    const profile = await User.findById(userId);
    if (!profile) throw new Error('User not found');

    // Requirement: Only admins can configure integrations in their profile
    if (profile.role !== 'admin') {
        throw new Error('Only admins can configure profile integrations');
    }

    const integrations = profile.integrations || {};
    const existingConfig = integrations[providerName] || {};
    
    // Merge new config with existing to preserve keys (ClientId, Secret)
    const mergedConfig = { ...existingConfig, ...config };
    
    // If we have an access token and aren't skipping validation
    if (mergedConfig.accessToken && !options.skipValidation) {
        const provider = IntegrationProvider(providerName, mergedConfig);
        const validation = await provider.connect();

        if (!validation.success) {
            throw new Error(`Failed to connect to ${providerName}`);
        }

        integrations[providerName] = {
            ...mergedConfig,
            connected: true,
            accountName: validation.accountName || validation.user || validation.name || validation.urn,
            personUrn: validation.personUrn || validation.urn || null,
            connectedAt: integrations[providerName]?.connectedAt || new Date(),
            updatedAt: new Date()
        };
    } else {
        // Just update configuration (keys) or metadata
        integrations[providerName] = {
            ...mergedConfig,
            // If accessToken was provided but validation was skipped, assume connected
            connected: mergedConfig.accessToken ? true : !!mergedConfig.connected,
            updatedAt: new Date()
        };
        
        // If we are saving connections from handleCallback, we want to normalize fields too
        if (config.accountName || config.urn || config.personUrn) {
            integrations[providerName].accountName = config.accountName || mergedConfig.accountName;
            integrations[providerName].personUrn = config.personUrn || config.urn || mergedConfig.personUrn;
        }
    }

    const updatedProfile = await User.findByIdAndUpdate(userId, { integrations }, { new: true });
    logger.info(`IntegrationService: User ${userId} updated integration: ${providerName}`);
    
    return updatedProfile;
}

/**
 * Get configured integration for a user
 * @param {string} userId 
 * @param {string} providerName 
 */
export async function getIntegration(userId, providerName) {
    const profile = await User.findById(userId);
    if (!profile || !profile.integrations) return null;
    return profile.integrations[providerName] || null;
}

/**
 * Sync data from an integration
 * @param {string} userId 
 * @param {string} providerName 
 * @param {Object} syncOptions 
 */
export async function syncIntegration(userId, providerName, syncOptions = {}) {
    const config = await getIntegration(userId, providerName);
    if (!config) throw new Error(`Integration ${providerName} not configured for this user`);

    const provider = IntegrationProvider(providerName, config);
    // Connect first
    await provider.connect();
    
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
        processedData = {
            memberId: rawProfile.id,
            accountName: `${rawProfile.firstName} ${rawProfile.lastName}`,
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
    const profile = await User.findById(userId);
    if (!profile || !profile.integrations) return null;

    const integrations = { ...profile.integrations };
    delete integrations[providerName];

    const updatedProfile = await User.findByIdAndUpdate(userId, { integrations }, { new: true });
    logger.info(`IntegrationService: User ${userId} removed integration: ${providerName}`);
    
    return updatedProfile;
}

/**
 * List all integrations for a user
 * @param {string} userId 
 */
export async function listIntegrations(userId) {
    const profile = await User.findById(userId);
    if (!profile) throw new Error('User not found');
    return profile.integrations || {};
}
