import GitHubIntegrationProvider from "./github/index.js";
import LinkedInIntegrationProvider from "./linkedin/index.js";

const integrationProviders = {
    github: GitHubIntegrationProvider,
    linkedin: LinkedInIntegrationProvider,
};

/**
 * Factory for Integration Providers
 * @param {string} providerName - 'github', etc.
 * @param {Object} config - Integration specific configuration
 * @returns {import('./base').default} Integration Provider Instance
 */
export function IntegrationProvider(providerName, config = {}) {
    const ProviderClass = integrationProviders[providerName];

    if (!ProviderClass) {
        throw new Error(`Integration provider '${providerName}' not found`);
    }

    return new ProviderClass(config);
}
