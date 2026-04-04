import { Organization } from '../models/index.js';
import logger from '../utils/logger.js';

export const ROLES = {
    ADMIN: 'admin',
    MODERATOR: 'moderator',
    USER: 'user'
};

const ROLE_WEIGHTS = {
    [ROLES.ADMIN]: 3,
    [ROLES.MODERATOR]: 2,
    [ROLES.USER]: 1
};

/**
 * Checks if the requester can change the target user's role to the new role.
 */
function canChangeRole(requesterRole, currentTargetRole, newRole) {
    const reqWeight = ROLE_WEIGHTS[requesterRole];
    const newWeight = ROLE_WEIGHTS[newRole];
    const targetWeight = currentTargetRole ? ROLE_WEIGHTS[currentTargetRole] : 0; // 0 if new user

    if (!reqWeight || !newWeight) return false;

    // Admins can do anything
    if (requesterRole === ROLES.ADMIN) {
        return true;
    }

    if (requesterRole === ROLES.MODERATOR) {
        // Cannot modify roles of admins or other moderators (equal or above hierarchy)
        if (currentTargetRole && targetWeight >= ROLE_WEIGHTS[ROLES.MODERATOR]) {
            return false;
        }

        // Cannot promote someone to admin
        if (newWeight > ROLE_WEIGHTS[ROLES.MODERATOR]) {
            return false;
        }

        return true;
    }

    // Users cannot change roles
    return false;
}

/**
 * Creates a new organization.
 */
export async function createOrganization(orgData, ownerId) {
    if (!ownerId) throw new Error('ownerId is required to create an organization');

    const data = {
        ...orgData,
        ownerId,
        members: [{
            userId: ownerId,
            role: ROLES.ADMIN,
            addedAt: new Date()
        }]
    };

    const org = await Organization.create(data);
    logger.info(`Organization created: ${org.name} by ${ownerId}`);
    return org;
}

/**
 * Updates an organization's details.
 */
export async function updateOrganization(orgId, requesterId, updates) {
    const org = await getOrganizationById(orgId);
    const members = org.members || [];

    const requesterRole = members.find(m => m.userId === requesterId)?.role;
    if (requesterRole !== ROLES.ADMIN) {
        throw new Error('Only organization admins can update organization details');
    }

    // Prevent updating sensitive internal fields
    delete updates.id;
    delete updates.ownerId;
    delete updates.members;
    delete updates.clients;
    delete updates.status;
    delete updates.createdAt;

    const updated = await Organization.findByIdAndUpdate(orgId, updates, { new: true });
    logger.info(`Organization ${orgId} updated by ${requesterId}`);
    return updated;
}

/**
 * Gets all organizations.
 */
export async function getAllOrganizations() {
    return await Organization.find({});
}

/**
 * Gets an organization by ID.
 */
export async function getOrganizationById(orgId) {
    const org = await Organization.findById(orgId);
    if (!org) throw new Error('Organization not found');
    return org;
}

/**
 * Gets a user's role in an organization.
 */
export async function getUserRole(orgId, userId) {
    const org = await getOrganizationById(orgId);
    const member = (org.members || []).find(m => m.userId === userId);
    return member ? member.role : null;
}

/**
 * Adds a new user to an organization.
 */
export async function addMember(orgId, requesterId, newUserId, role = ROLES.USER) {
    const org = await getOrganizationById(orgId);
    const members = org.members || [];

    const requesterRole = members.find(m => m.userId === requesterId)?.role;
    if (!requesterRole) {
        throw new Error('Requester is not a member of this organization');
    }

    if (members.some(m => m.userId === newUserId)) {
        throw new Error('User is already a member of this organization');
    }

    if (!canChangeRole(requesterRole, null, role)) {
        throw new Error('Insufficient permissions to add member with this role');
    }

    const updatedMembers = [...members, {
        userId: newUserId,
        role,
        addedAt: new Date()
    }];

    const updated = await Organization.findByIdAndUpdate(orgId, { members: updatedMembers }, { new: true });
    logger.info(`User ${newUserId} added to organization ${orgId} with role ${role}`);
    return updated;
}

/**
 * Updates an existing member's role.
 */
export async function updateMemberRole(orgId, requesterId, targetUserId, newRole) {
    const org = await getOrganizationById(orgId);
    const members = org.members || [];

    const requesterRole = members.find(m => m.userId === requesterId)?.role;
    if (!requesterRole) {
        throw new Error('Requester is not a member of this organization');
    }

    const targetMemberIndex = members.findIndex(m => m.userId === targetUserId);
    if (targetMemberIndex === -1) {
        throw new Error('Target user is not a member of this organization');
    }

    const currentTargetRole = members[targetMemberIndex].role;

    if (!canChangeRole(requesterRole, currentTargetRole, newRole)) {
        throw new Error('Insufficient permissions to change this user\'s role');
    }

    if (targetUserId === org.ownerId && newRole !== ROLES.ADMIN) {
        throw new Error('Cannot downgrade the organization owner');
    }

    members[targetMemberIndex] = {
        ...members[targetMemberIndex],
        role: newRole,
        updatedAt: new Date()
    };

    const updated = await Organization.findByIdAndUpdate(orgId, { members }, { new: true });
    logger.info(`User ${targetUserId} role updated to ${newRole} in organization ${orgId}`);
    return updated;
}

/**
 * Removes a member from an organization.
 */
export async function removeMember(orgId, requesterId, targetUserId) {
    const org = await getOrganizationById(orgId);
    const members = org.members || [];

    const requesterRole = members.find(m => m.userId === requesterId)?.role;
    if (!requesterRole) {
        throw new Error('Requester is not a member of this organization');
    }

    const targetRole = members.find(m => m.userId === targetUserId)?.role;
    if (!targetRole) {
        throw new Error('Target user is not a member of this organization');
    }

    if (targetUserId === org.ownerId) {
        throw new Error('Cannot remove the organization owner');
    }

    const reqWeight = ROLE_WEIGHTS[requesterRole];
    const targetWeight = ROLE_WEIGHTS[targetRole];

    if (requesterRole !== ROLES.ADMIN) {
        // Moderators cannot remove admins or other moderators
        if (reqWeight <= targetWeight) {
            throw new Error('Insufficient permissions to remove this user');
        }
    }

    const updatedMembers = members.filter(m => m.userId !== targetUserId);

    const updated = await Organization.findByIdAndUpdate(orgId, { members: updatedMembers }, { new: true });
    logger.info(`User ${targetUserId} removed from organization ${orgId}`);
    return updated;
}

/**
 * Adds a new client URL to the organization whitelist.
 */
export async function addClient(orgId, requesterId, url, whitelistedApis = []) {
    const org = await getOrganizationById(orgId);
    const members = org.members || [];

    const requesterRole = members.find(m => m.userId === requesterId)?.role;
    if (requesterRole !== ROLES.ADMIN) {
        throw new Error('Only organization admins can add client applications');
    }

    const clients = org.clients || [];
    if (clients.some(c => c.url === url)) {
        throw new Error('This client URL is already registered');
    }

    const updatedClients = [...clients, {
        url,
        whitelistedApis,
        addedAt: new Date()
    }];

    const updated = await Organization.findByIdAndUpdate(orgId, { clients: updatedClients }, { new: true });
    logger.info(`Client ${url} added to organization ${orgId}`);
    return updated;
}

/**
 * Updates a whitelisted client's configuration.
 */
export async function updateClient(orgId, requesterId, url, whitelistedApis) {
    const org = await getOrganizationById(orgId);
    const members = org.members || [];

    const requesterRole = members.find(m => m.userId === requesterId)?.role;
    if (requesterRole !== ROLES.ADMIN) {
        throw new Error('Only organization admins can update client applications');
    }

    const clients = org.clients || [];
    const clientIndex = clients.findIndex(c => c.url === url);
    if (clientIndex === -1) {
        throw new Error('Client not found');
    }

    clients[clientIndex] = {
        ...clients[clientIndex],
        whitelistedApis,
        updatedAt: new Date()
    };

    const updated = await Organization.findByIdAndUpdate(orgId, { clients }, { new: true });
    logger.info(`Client ${url} updated in organization ${orgId}`);
    return updated;
}

/**
 * Removes a client URL from the organization whitelist.
 */
export async function removeClient(orgId, requesterId, url) {
    const org = await getOrganizationById(orgId);
    const members = org.members || [];

    const requesterRole = members.find(m => m.userId === requesterId)?.role;
    if (requesterRole !== ROLES.ADMIN) {
        throw new Error('Only organization admins can remove client applications');
    }

    const clients = org.clients || [];
    const updatedClients = clients.filter(c => c.url !== url);

    if (clients.length === updatedClients.length) {
        throw new Error('Client not found');
    }

    const updated = await Organization.findByIdAndUpdate(orgId, { clients: updatedClients }, { new: true });
    logger.info(`Client ${url} removed from organization ${orgId}`);
    return updated;
}
