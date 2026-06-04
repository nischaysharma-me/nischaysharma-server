import { Education } from '../models/index.js';

/**
 * Get all education for a user
 */
export const getUserEducation = async (userId) => {
    return await Education.find({ userId }, { sort: { order: 1 } });
};

/**
 * Create a new education record
 */
export const createEducation = async (userId, data) => {
    return await Education.create({ ...data, userId });
};

/**
 * Update an education record
 */
export const updateEducation = async (id, data) => {
    return await Education.findByIdAndUpdate(id, data, { new: true });
};

/**
 * Delete an education record
 */
export const deleteEducation = async (id) => {
    return await Education.findByIdAndDelete(id);
};
