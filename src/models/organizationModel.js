import FirebaseModel from '../utils/firebaseModel.js';

/**
 * Organization Schema Definition (Mongoose-style)
 */
const organizationSchema = {
    name: {
        type: String,
        required: true,
        trim: true
    },
    orgCode: {
        type: String,
        trim: true
    },
    slug: {
        type: String,
        trim: true,
        lowercase: true
    },
    type: {
        type: String,
        enum: ['enterprise', 'startup', 'personal'],
        default: 'personal'
    },
    description: {
        type: String,
        maxlength: 500
    },
    ownerId: {
        type: String,
        required: true // The Admin of the organization
    },
    members: {
        type: Array, // Array of { userId, role, addedAt }
        default: []
    },
    settings: {
        type: Object,
        default: {
            allowApiKeys: true,
            maxUsers: 50
        }
    },
    status: {
        type: Object,
        default: {
            state: 'active',
            reason: null,
            changedBy: null,
            changedAt: new Date()
        }
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

const Organization = new FirebaseModel('organizations', organizationSchema);

export default Organization;
