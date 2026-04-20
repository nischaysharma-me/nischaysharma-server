import FirebaseAuthProvider from "./firebase/index.js"

const AUTH_PROVIDERS = {
    firebase: FirebaseAuthProvider
};

export function AuthProvider(name) {
    const ProviderClass = AUTH_PROVIDERS[name];
    if (!ProviderClass) {
        throw new Error(`Auth provider ${name} not found`);
    }
    return new ProviderClass();
}

export default AuthProvider;
