import * as eventService from '../services/eventService.js';
import logger from '../utils/logger.js';

/**
 * Handle storage of received WebSocket events
 */
export async function storeEvent(req, res) {
    try {
        const { type, payload, deviceId } = req.body;
        const userId = req.user.uid;

        if (!type || !payload) {
            return res.status(400).json({ 
                success: false, 
                message: 'Event type and payload are required' 
            });
        }

        const event = await eventService.createEvent({
            userId,
            type,
            payload,
            deviceId,
            source: 'websocket'
        });

        res.status(201).json({
            success: true,
            data: event
        });
    } catch (error) {
        logger.error(`Error in storeEvent controller: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Failed to store event'
        });
    }
}

/**
 * Get user events history
 */
export async function listUserEvents(req, res) {
    try {
        const userId = req.user.uid;
        const events = await eventService.getUserEvents(userId);
        
        res.status(200).json({
            success: true,
            data: events
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch events'
        });
    }
}
