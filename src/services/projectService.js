import { Project, Article } from '../models/index.js';
import logger from '../utils/logger.js';

/**
 * Get all projects for a user
 */
async function getUserProjects(userId) {
    return await Project.find({ userId });
}

/**
 * Get a single project
 */
async function getProjectById(id) {
    return await Project.findById(id);
}

/**
 * Create a new project
 */
async function createProject(userId, projectData) {
    return await Project.create({
        ...projectData,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
    });
}

/**
 * Update an existing project
 */
async function updateProject(id, userId, updateData) {
    const project = await Project.findById(id);
    if (!project) throw new Error('Project not found');
    if (project.userId !== userId) throw new Error('Unauthorized');

    return await Project.findByIdAndUpdate(id, {
        ...updateData,
        updatedAt: new Date()
    }, { new: true });
}

/**
 * Delete a project
 */
async function deleteProject(id, userId) {
    const project = await Project.findById(id);
    if (!project) {
        logger.error(`ProjectService: Project with ID ${id} not found`);
        throw new Error('Project not found');
    }

    if (project.userId !== userId) {
        logger.error(`ProjectService: Unauthorized delete attempt. Project owner: ${project.userId}, Requestor: ${userId}`);
        throw new Error('Unauthorized');
    }

    return await Project.findByIdAndDelete(id);
}

/**
 * Bulk sync projects (from GitHub import for example)
 */
async function syncProjects(userId, projectsList) {
    // This is a simple implementation that replaces or adds
    // Depending on logic. For now, let's just allow single operations.
}

export {
    getUserProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    syncProjects
};
