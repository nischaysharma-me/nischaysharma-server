import { Experience } from '../models/index.js';

/**
 * Get all experience for a user
 */
export const getUserExperiences = async (userId) => {
    return await Experience.find({ userId }, { sort: { order: 1 } });
};

/**
 * Create a new experience record
 */
export const createExperience = async (userId, data) => {
    return await Experience.create({ ...data, userId });
};

/**
 * Update an experience record
 */
export const updateExperience = async (id, data) => {
    return await Experience.findByIdAndUpdate(id, data, { new: true });
};

/**
 * Delete an experience record
 */
export const deleteExperience = async (id) => {
    return await Experience.findByIdAndDelete(id);
};
