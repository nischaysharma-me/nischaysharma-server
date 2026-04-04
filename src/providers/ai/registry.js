import GeminiAIProvider from "./gemini/index.js";

const aiProviders = {
    gemini: GeminiAIProvider,
};

export function AIProvider(providerName) {
    const ProviderClass = aiProviders[providerName];

    if (!ProviderClass) {
        throw new Error("AI provider not found");
    }

    return new ProviderClass();
}
