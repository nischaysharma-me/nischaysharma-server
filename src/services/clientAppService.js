import { ClientApp } from '../models/index.js';
import logger from '../utils/logger.js';

/**
 * Creates a new client application.
 */
export async function createClientApp(data, ownerId) {
    const appData = {
        ...data,
        ownerId,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const clientApp = await ClientApp.create(appData);
    logger.info(`Client application created: ${clientApp.name} for URL ${clientApp.url}`);
    return clientApp;
}

/**
 * Gets all client applications.
 */
export async function getAllClientApps() {
    return await ClientApp.find({});
}

/**
 * Gets a client application by ID.
 */
export async function getClientAppById(id) {
    const app = await ClientApp.findById(id);
    if (!app) throw new Error('Client application not found');
    return app;
}

/**
 * Gets a client application by URL.
 */
export async function getClientAppByUrl(url) {
    return await ClientApp.findOne({ url, status: 'active' });
}

/**
 * Updates a client application.
 */
export async function updateClientApp(id, updates) {
    const app = await getClientAppById(id);
    
    const updated = await ClientApp.findByIdAndUpdate(id, {
        ...updates,
        updatedAt: new Date()
    }, { new: true });

    logger.info(`Client application updated: ${id}`);
    return updated;
}

/**
 * Deletes a client application.
 */
export async function deleteClientApp(id) {
    await getClientAppById(id);
    await ClientApp.findByIdAndDelete(id);
    logger.info(`Client application deleted: ${id}`);
    return true;
}

/**
 * Registers a device for a client application.
 */
export async function registerDevice(id, deviceInfo) {
    const app = await getClientAppById(id);
    
    const registeredDevices = app.registeredDevices || [];
    const existingIndex = registeredDevices.findIndex(d => d.deviceId === deviceInfo.deviceId);

    if (existingIndex > -1) {
        registeredDevices[existingIndex] = {
            ...registeredDevices[existingIndex],
            ...deviceInfo,
            lastConnectedAt: new Date()
        };
    } else {
        registeredDevices.push({
            ...deviceInfo,
            lastConnectedAt: new Date()
        });
    }

    await ClientApp.findByIdAndUpdate(id, { registeredDevices });
    return { success: true, message: 'Device registered successfully' };
}
