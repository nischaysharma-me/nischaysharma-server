import express from 'express';
import * as organizationController from '../controllers/organizationController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Organizations
 *   description: Organization and member management
 */

// All organization routes require authentication
router.use(isAuthenticated);

// List all organizations
router.get('/', organizationController.listOrganizations);

// Create a new organization
router.post('/', organizationController.createOrganization);

// Get an organization by ID
router.get('/:orgId', organizationController.getOrganization);

// Update organization details
router.patch('/:orgId', organizationController.updateOrganization);

// Add a member to an organization
router.post('/:orgId/members', organizationController.addMember);

// Update a member's role
router.put('/:orgId/members/:userId/role', organizationController.updateMemberRole);

// Remove a member from an organization
router.delete('/:orgId/members/:userId', organizationController.removeMember);

// Add a client to an organization
router.post('/:orgId/clients', organizationController.addClient);

// Update an organization client
router.put('/:orgId/clients', organizationController.updateClient);

// Remove an organization client
router.delete('/:orgId/clients', organizationController.removeClient);

export default router;
