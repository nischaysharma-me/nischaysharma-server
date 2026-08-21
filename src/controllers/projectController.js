import * as projectService from '../services/projectService.js';
import logger from '../utils/logger.js';

export const getUserProjects = async (req, res) => {
    try {
        const userId = req.user.uid;
        const projects = await projectService.getUserProjects(userId);
        res.json({ success: true, data: projects });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const createProject = async (req, res) => {
    try {
        const userId = req.user.uid;
        const project = await projectService.createProject(userId, req.body);
        res.status(201).json({ success: true, data: project });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

export const updateProject = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { id } = req.params;
        const project = await projectService.updateProject(id, userId, req.body);
        res.json({ success: true, data: project });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

export const deleteProject = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { id } = req.params;
        logger.info(`ProjectController: Attempting to delete project ${id} for user ${userId}`);
        await projectService.deleteProject(id, userId);
        res.json({ success: true, message: 'Project deleted' });
    } catch (error) {
        logger.error(`ProjectController: Error deleting project: ${error.message}`);
        const status = error.message === 'Project not found' ? 404 : (error.message === 'Unauthorized' ? 403 : 400);
        res.status(status).json({ success: false, error: error.message });
    }
};
