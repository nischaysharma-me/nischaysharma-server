import * as educationService from '../services/educationService.js';
import * as userService from '../services/userProfileService.js';
import logger from '../utils/logger.js';

async function getUserId(req) {
    const profile = await userService.getUser(req.user.uid);
    return profile?.id;
}

export const getEducation = async (req, res) => {
    try {
        const userId = await getUserId(req);
        if (!userId) return res.json({ success: true, data: [] });
        const education = await educationService.getUserEducation(userId);
        res.json({ success: true, data: education });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const createEducation = async (req, res) => {
    try {
        const userId = await getUserId(req);
        const data = req.body;
        const education = await educationService.createEducation(userId, data);
        res.json({ success: true, data: education });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

export const updateEducation = async (req, res) => {
    try {
        const education = await educationService.updateEducation(req.params.id, req.body);
        res.json({ success: true, data: education });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

export const deleteEducation = async (req, res) => {
    try {
        await educationService.deleteEducation(req.params.id);
        res.json({ success: true, message: 'Education deleted' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
