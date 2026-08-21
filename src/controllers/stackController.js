import { StackItem } from '../models/index.js';
import logger from '../utils/logger.js';
import * as jobService from '../services/jobService.js';

/**
 * List all stack items
 */
export const listStackItems = async (req, res) => {
    try {
        const items = await StackItem.find({}, { sort: { order: 1 } });
        res.status(200).json({
            success: true,
            data: items
        });
    } catch (error) {
        logger.error('StackController: Error listing items', error);
        res.status(500).json({
            success: false,
            message: 'Failed to list stack items'
        });
    }
};

/**
 * Create a new stack item
 */
export const createStackItem = async (req, res) => {
    try {
        const newItem = await StackItem.create(req.body);
        res.status(201).json({
            success: true,
            data: newItem
        });
    } catch (error) {
        logger.error('StackController: Error creating item', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create stack item'
        });
    }
};

/**
 * Update a stack item
 */
export const updateStackItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedItem = await StackItem.findByIdAndUpdate(id, {
            ...req.body,
            updatedAt: new Date()
        }, { new: true });

        if (!updatedItem) {
            return res.status(404).json({
                success: false,
                message: 'Stack item not found'
            });
        }

        res.status(200).json({
            success: true,
            data: updatedItem
        });
    } catch (error) {
        logger.error('StackController: Error updating item', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update stack item'
        });
    }
};

/**
 * Delete a stack item
 */
export const deleteStackItem = async (req, res) => {
    try {
        const { id } = req.params;
        await StackItem.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: 'Stack item deleted successfully'
        });
    } catch (error) {
        logger.error('StackController: Error deleting item', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete stack item'
        });
    }
};

/**
 * Generate AI image for stack item
 */
export const generateImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { prompt } = req.body;
        const { uid } = req.user;

        const job = await jobService.addJob('stack-image-generation', {
            stackItemId: id,
            prompt
        }, uid);

        res.status(202).json({
            success: true,
            data: {
                jobId: job.id,
                status: 'queued'
            }
        });
    } catch (error) {
        logger.error('StackController: Error queueing image generation', error);
        res.status(500).json({
            success: false,
            message: 'Failed to queue image generation'
        });
    }
};
