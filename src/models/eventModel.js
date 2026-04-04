import FirebaseModel from '../utils/firebaseModel.js';

/**
 * Event Schema Definition
 * Stores received WebSocket events for auditing and history
 */
const eventSchema = {
    userId: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true // e.g., 'job:completed', 'job:failed'
    },
    payload: {
        type: Object,
        required: true // The actual event data
    },
    source: {
        type: String, // e.g., 'websocket'
        default: 'websocket'
    },
    receivedAt: {
        type: Date,
        default: () => new Date()
    },
    deviceId: {
        type: String // Optional: tracking which device received it
    }
};

const Event = new FirebaseModel('events', eventSchema);

export default Event;
