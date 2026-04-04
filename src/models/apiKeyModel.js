import FirebaseModel from '../utils/firebaseModel.js';

/**
 * API Key Schema Definition
 */
const apiKeySchema = {
    name: {
        type: String,
        required: true,
        trim: true
    },
    keyHash: {
        type: String,
        required: true
    },
    prefix: {
        type: String,
        required: true
    },
    organizationId: {
        type: String,
        required: true
    },
    createdBy: {
        type: String,
        required: true
    },
    scopes: {
        type: Array,
        default: ['*']
    },
    status: {
        type: String,
        enum: ['active', 'revoked', 'expired'],
        default: 'active'
    },
    lastUsedAt: {
        type: Date
    },
    expiresAt: {
        type: Date
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

const ApiKey = new FirebaseModel('api_keys', apiKeySchema);

export default ApiKey;
