import dotenv from "dotenv";
dotenv.config();
// console.log(process.env);
/**
 * AI Provider Configuration
 * Centralized configuration for all AI providers
 */

/**
 * Common AI configuration across all providers
 */
const COMMON_CONFIG = {
    // Active provider (can be switched via environment)
    activeProvider: process.env.AI_PROVIDER || "gemini",

    // Common generation settings (can be overridden per provider)
    defaultTemperature: parseFloat(process.env.AI_TEMPERATURE || "0.7"),
    defaultMaxTokens: parseInt(process.env.AI_MAX_TOKENS || "2048", 10),
    defaultTopP: parseFloat(process.env.AI_TOP_P || "0.95"),
    defaultTopK: parseInt(process.env.AI_TOP_K || "40", 10),

    // Tools configuration
    enableTools: process.env.AI_ENABLE_TOOLS === "true",
};

/**
 * Tools Configuration
 */
const TOOLS_CONFIG = {
    // Google Search
    googleSearch: {
        enabled: process.env.GOOGLE_SEARCH_ENABLED === "true",
        apiKey: process.env.GOOGLE_SEARCH_API_KEY,
        searchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID,
    },

    // Future tools can be added here
    // webScraper: { ... },
    // calculator: { ... },
};

/**
 * Gemini (Google) Configuration
 */
const GEMINI_CONFIG = {
    apiKey: process.env.GEMINI_API_KEY,

    models: {
        flash: process.env.GEMINI_FLASH_MODEL || "gemini-1.5-flash",
        pro: process.env.GEMINI_PRO_MODEL || "gemini-1.5-pro",
        image: process.env.GEMINI_IMAGE_MODEL || "imagen-3.0-generate-001",
    },

    defaultModel: process.env.GEMINI_DEFAULT_MODEL || "gemini-1.5-flash",

    generationConfig: {
        temperature: parseFloat(process.env.GEMINI_TEMPERATURE || COMMON_CONFIG.defaultTemperature),
        maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS || COMMON_CONFIG.defaultMaxTokens, 10),
        topP: parseFloat(process.env.GEMINI_TOP_P || COMMON_CONFIG.defaultTopP),
        topK: parseInt(process.env.GEMINI_TOP_K || COMMON_CONFIG.defaultTopK, 10),
    },
};

/**
 * OpenAI Configuration
 */
const OPENAI_CONFIG = {
    apiKey: process.env.OPENAI_API_KEY,

    models: {
        gpt4: process.env.OPENAI_GPT4_MODEL || "gpt-4-turbo-preview",
        gpt35: process.env.OPENAI_GPT35_MODEL || "gpt-3.5-turbo",
    },

    defaultModel: process.env.OPENAI_DEFAULT_MODEL || "gpt-4-turbo-preview",

    generationConfig: {
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || COMMON_CONFIG.defaultTemperature),
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || COMMON_CONFIG.defaultMaxTokens, 10),
        topP: parseFloat(process.env.OPENAI_TOP_P || COMMON_CONFIG.defaultTopP),
    },
};

/**
 * Anthropic (Claude) Configuration
 */
const ANTHROPIC_CONFIG = {
    apiKey: process.env.ANTHROPIC_API_KEY,

    models: {
        opus: process.env.ANTHROPIC_OPUS_MODEL || "claude-3-opus-20240229",
        sonnet: process.env.ANTHROPIC_SONNET_MODEL || "claude-3-5-sonnet-20241022",
        haiku: process.env.ANTHROPIC_HAIKU_MODEL || "claude-3-5-haiku-20241022",
    },

    defaultModel: process.env.ANTHROPIC_DEFAULT_MODEL || "claude-3-5-sonnet-20241022",

    generationConfig: {
        temperature: parseFloat(process.env.ANTHROPIC_TEMPERATURE || COMMON_CONFIG.defaultTemperature),
        maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || COMMON_CONFIG.defaultMaxTokens, 10),
        topP: parseFloat(process.env.ANTHROPIC_TOP_P || COMMON_CONFIG.defaultTopP),
        topK: parseInt(process.env.ANTHROPIC_TOP_K || COMMON_CONFIG.defaultTopK, 10),
    },
};

/**
 * Main AI Configuration
 * Exports provider-specific configs and common settings
 */
const AI_CONFIG = {
    // Active provider
    provider: COMMON_CONFIG.activeProvider,

    // Common settings
    common: COMMON_CONFIG,

    // Tools configuration
    tools: TOOLS_CONFIG,

    // Provider-specific configurations
    gemini: GEMINI_CONFIG,
    openai: OPENAI_CONFIG,
    anthropic: ANTHROPIC_CONFIG,

    /**
     * Get active provider configuration
     * @returns {object} Active provider config
     */
    getActiveConfig() {
        const provider = this.provider.toLowerCase();

        switch (provider) {
            case "gemini":
                return this.gemini;
            case "openai":
                return this.openai;
            case "anthropic":
                return this.anthropic;
            default:
                throw new Error(`Unknown AI provider: ${provider}`);
        }
    },
};

export {
    AI_CONFIG,
    GEMINI_CONFIG,
    OPENAI_CONFIG,
    ANTHROPIC_CONFIG,
    COMMON_CONFIG,
    TOOLS_CONFIG,
};
