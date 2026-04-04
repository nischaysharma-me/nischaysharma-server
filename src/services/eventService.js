import { Event } from '../models/index.js';
import logger from '../utils/logger.js';

/**
 * Service for handling Event storage and retrieval
 */
export async function createEvent(data) {
    try {
        const event = await Event.create({
            ...data,
            receivedAt: new Date()
        });
        logger.info(`Event stored: ${event.id} (type: ${data.type})`);
        return event;
    } catch (error) {
        logger.error(`Error creating event: ${error.message}`);
        throw error;
    }
}

/**
 * List events for a specific user
 */
export async function getUserEvents(userId) {
    return await Event.find({ userId }, { sort: { receivedAt: 'desc' } });
}
