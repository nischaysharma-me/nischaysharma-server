import FirebaseStorageProvider from './firebase/index.js';

const storageProviders = {
    firebase: FirebaseStorageProvider,
    // future providers: s3, azure, etc.
};

/**
 * Factory for Storage Providers
 * @param {string} providerName - 'firebase', 's3', etc.
 * @returns {import('./base').default} Storage Provider Instance
 */
export function StorageProvider(providerName = 'firebase') {
    const ProviderClass = storageProviders[providerName];

    if (!ProviderClass) {
        throw new Error(`Storage provider '${providerName}' not found`);
    }

    return new ProviderClass();
}
