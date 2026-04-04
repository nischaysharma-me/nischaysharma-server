import * as organizationService from '../services/organizationService.js';
import * as userService from '../services/userProfileService.js';
import logger from '../utils/logger.js';

export async function createOrganization(req, res) {
    try {
        const ownerId = req.user.uid; // Note: use uid from firebase auth
        const orgData = req.body;
        
        if (!orgData.name) {
            return res.status(400).json({ success: false, error: 'Organization name is required' });
        }

        const org = await organizationService.createOrganization(orgData, ownerId);
        
        // Update user profile with the new organizationId
        await userService.updateUser(ownerId, { organizationId: org.id });
        
        res.status(201).json({ success: true, data: org });
    } catch (error) {
        logger.error('Error creating organization:', error);
        res.status(500).json({ success: false, error: error.message || 'Server error' });
    }
}

export async function updateOrganization(req, res) {
    try {
        const { orgId } = req.params;
        const requesterId = req.user.id;
        const updates = req.body;

        const org = await organizationService.updateOrganization(orgId, requesterId, updates);
        res.status(200).json({ success: true, data: org });
    } catch (error) {
        logger.error('Error updating organization:', error);
        const status = error.message.includes('Only organization admins') ? 403 : 400;
        res.status(status).json({ success: false, error: error.message || 'Server error' });
    }
}

export async function listOrganizations(req, res) {
    try {
        const userId = req.user.uid;
        const orgs = await organizationService.getAllOrganizations();

        const processedOrgs = orgs.map(org => ({
            ...org,
            isOwner: org.ownerId === userId,
            isMember: org.members?.some(m => m.userId === userId) || org.ownerId === userId
        }));

        res.status(200).json({ success: true, data: processedOrgs });
    } catch (error) {
        logger.error('Error listing organizations:', error);
        res.status(500).json({ success: false, error: error.message || 'Server error' });
    }
}

export async function getOrganization(req, res) {
    try {
        const { orgId } = req.params;
        const org = await organizationService.getOrganizationById(orgId);
        res.status(200).json({ success: true, data: org });
    } catch (error) {
        logger.error('Error getting organization:', error);
        res.status(error.message === 'Organization not found' ? 404 : 500).json({ success: false, error: error.message || 'Server error' });
    }
}

export async function addMember(req, res) {
    try {
        const { orgId } = req.params;
        const requesterId = req.user.id;
        const { userId, role } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID is required' });
        }

        const org = await organizationService.addMember(orgId, requesterId, userId, role);
        res.status(200).json({ success: true, data: org });
    } catch (error) {
        logger.error('Error adding member to organization:', error);
        const status = error.message.includes('Insufficient permissions') || error.message.includes('not a member') ? 403 : 400;
        res.status(status).json({ success: false, error: error.message || 'Server error' });
    }
}

export async function updateMemberRole(req, res) {
    try {
        const { orgId, userId } = req.params;
        const requesterId = req.user.id;
        const { role } = req.body;

        if (!role) {
            return res.status(400).json({ success: false, error: 'Role is required' });
        }

        const org = await organizationService.updateMemberRole(orgId, requesterId, userId, role);
        res.status(200).json({ success: true, data: org });
    } catch (error) {
        logger.error('Error updating member role:', error);
        const status = error.message.includes('Insufficient permissions') || error.message.includes('not a member') ? 403 : 400;
        res.status(status).json({ success: false, error: error.message || 'Server error' });
    }
}

export async function removeMember(req, res) {
    try {
        const { orgId, userId } = req.params;
        const requesterId = req.user.id;

        const org = await organizationService.removeMember(orgId, requesterId, userId);
        res.status(200).json({ success: true, data: org });
    } catch (error) {
        logger.error('Error removing member from organization:', error);
        const status = error.message.includes('Insufficient permissions') || error.message.includes('not a member') ? 403 : 400;
        res.status(status).json({ success: false, error: error.message || 'Server error' });
    }
}

export async function addClient(req, res) {
    try {
        const { orgId } = req.params;
        const requesterId = req.user.id;
        const { url, whitelistedApis } = req.body;

        if (!url) {
            return res.status(400).json({ success: false, error: 'Client URL is required' });
        }

        const org = await organizationService.addClient(orgId, requesterId, url, whitelistedApis);
        res.status(200).json({ success: true, data: org });
    } catch (error) {
        logger.error('Error adding client to organization:', error);
        const status = error.message.includes('Only organization admins') ? 403 : 400;
        res.status(status).json({ success: false, error: error.message || 'Server error' });
    }
}

export async function updateClient(req, res) {
    try {
        const { orgId } = req.params;
        const requesterId = req.user.id;
        const { url, whitelistedApis } = req.body;

        if (!url) {
            return res.status(400).json({ success: false, error: 'Client URL is required' });
        }

        if (!whitelistedApis || !Array.isArray(whitelistedApis)) {
            return res.status(400).json({ success: false, error: 'Whitelisted APIs must be an array' });
        }

        const org = await organizationService.updateClient(orgId, requesterId, url, whitelistedApis);
        res.status(200).json({ success: true, data: org });
    } catch (error) {
        logger.error('Error updating organization client:', error);
        const status = error.message.includes('Only organization admins') ? 403 : 400;
        res.status(status).json({ success: false, error: error.message || 'Server error' });
    }
}

export async function removeClient(req, res) {
    try {
        const { orgId } = req.params;
        const requesterId = req.user.id;
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ success: false, error: 'Client URL is required in request body' });
        }

        const org = await organizationService.removeClient(orgId, requesterId, url);
        res.status(200).json({ success: true, data: org });
    } catch (error) {
        logger.error('Error removing organization client:', error);
        const status = error.message.includes('Only organization admins') ? 403 : 400;
        res.status(status).json({ success: false, error: error.message || 'Server error' });
    }
}