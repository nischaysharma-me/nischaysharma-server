import * as experienceService from '../services/experienceService.js';
import * as userService from '../services/userProfileService.js';
import logger from '../utils/logger.js';

async function getUserId(req) {
    const profile = await userService.getUser(req.user.uid);
    return profile?.id;
}

export const getExperiences = async (req, res) => {
    try {
        const userId = await getUserId(req);
        if (!userId) return res.json({ success: true, data: [] });
        const experiences = await experienceService.getUserExperiences(userId);
        res.json({ success: true, data: experiences });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const createExperience = async (req, res) => {
    try {
        const userId = await getUserId(req);
        const data = req.body;
        const experience = await experienceService.createExperience(userId, data);
        res.json({ success: true, data: experience });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

export const updateExperience = async (req, res) => {
    try {
        const experience = await experienceService.updateExperience(req.params.id, req.body);
        res.json({ success: true, data: experience });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

export const deleteExperience = async (req, res) => {
    try {
        await experienceService.deleteExperience(req.params.id);
        res.json({ success: true, message: 'Experience deleted' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
