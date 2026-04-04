import * as clientAppService from '../services/clientAppService.js';
import { getPermissionMetadata } from '../config/permissions.js';
import logger from '../utils/logger.js';

export async function createClientApp(req, res) {
    try {
        const ownerId = req.user.uid || req.user.id;
        const app = await clientAppService.createClientApp(req.body, ownerId);
        res.status(201).json({ success: true, data: app });
    } catch (error) {
        logger.error('Error creating client app:', error);
        res.status(400).json({ success: false, error: error.message });
    }
}

export async function getAllClientApps(req, res) {
    try {
        const apps = await clientAppService.getAllClientApps();
        res.status(200).json({ success: true, data: apps });
    } catch (error) {
        logger.error('Error fetching client apps:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

export async function registerDevice(req, res) {
    try {
        const result = await clientAppService.registerDevice(req.params.id, req.body);
        res.status(200).json(result);
    } catch (error) {
        logger.error('Error registering device:', error);
        res.status(400).json({ success: false, error: error.message });
    }
}

export async function getClientApp(req, res) {
    try {
        const app = await clientAppService.getClientAppById(req.params.id);
        res.status(200).json({ success: true, data: app });
    } catch (error) {
        res.status(404).json({ success: false, error: error.message });
    }
}

export async function updateClientApp(req, res) {
    try {
        const app = await clientAppService.updateClientApp(req.params.id, req.body);
        res.status(200).json({ success: true, data: app });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
}

export async function deleteClientApp(req, res) {
    try {
        await clientAppService.deleteClientApp(req.params.id);
        res.status(200).json({ success: true, message: 'Client application deleted' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
}

export async function getAvailablePermissions(req, res) {
    try {
        const permissions = getPermissionMetadata();
        res.status(200).json({ success: true, data: permissions });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
