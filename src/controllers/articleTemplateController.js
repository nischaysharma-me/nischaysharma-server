import * as templateService from '../services/articleTemplateService.js';
import { TEMPLATE_CONFIG } from '../config/templateConfig.js';

/**
 * Get template configurations
 */
const getTemplateConfig = async (req, res) => {
    try {
        res.json({
            success: true,
            data: TEMPLATE_CONFIG
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Generate a template using AI
 */
const generateTemplate = async (req, res) => {
    try {
        const { uid } = req.user;
        const { description, category } = req.body;

        if (!description) {
            return res.status(400).json({ success: false, error: 'Description is required' });
        }

        const template = await templateService.generateTemplate(uid, description, category);

        res.status(201).json({
            success: true,
            data: template
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * List all templates
 */
const listTemplates = async (req, res) => {
    try {
        const filters = req.query;
        const templates = await templateService.listTemplates(filters);

        res.json({
            success: true,
            data: templates
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Get template by slug
 */
const getTemplateBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const template = await templateService.getTemplateBySlug(slug);

        res.json({
            success: true,
            data: template
        });
    } catch (error) {
        res.status(404).json({ success: false, error: error.message });
    }
};

/**
 * Update template
 */
const updateTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedTemplate = await templateService.updateTemplate(id, updates);

        res.json({
            success: true,
            data: updatedTemplate
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

/**
 * Delete template
 */
const deleteTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        await templateService.deleteTemplate(id);

        res.json({
            success: true,
            message: 'Template deleted successfully'
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

export {
    getTemplateConfig,
    generateTemplate,
    listTemplates,
    getTemplateBySlug,
    updateTemplate,
    deleteTemplate
};
