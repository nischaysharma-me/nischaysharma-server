import FirebaseModel from '../utils/firebaseModel.js';

/**
 * ClientApp Schema Definition
 */
const clientAppSchema = {
    name: {
        type: String,
        required: true,
        trim: true
    },
    url: {
        type: String,
        required: true,
        trim: true
    },
    ownerId: {
        type: String,
        required: true
    },
    permissions: {
        type: Array, // Array of strings matching CLIENT_PERMISSIONS keys
        default: []
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    registeredDevices: {
        type: Array, // Array of { deviceId, name, type, lastConnectedAt, socketId }
        default: []
    },
    createdAt: {
        type: Date,
        default: () => new Date()
    },
    updatedAt: {
        type: Date,
        default: () => new Date()
    }
};

const ClientApp = new FirebaseModel('clientApps', clientAppSchema);

export default ClientApp;
