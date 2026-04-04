import FirebaseAuthProvider from "./firebase/index.js"
import ApiKeyProvider from "./apiKey.js"

const authProviders = {
    firebase: FirebaseAuthProvider,
    apiKey: ApiKeyProvider,
}

export function AuthProvider(providerName) {
    const ProviderClass = authProviders[providerName]

    if (!ProviderClass) {
        throw new Error("Auth provider not found")
    }

    return new ProviderClass()
}

