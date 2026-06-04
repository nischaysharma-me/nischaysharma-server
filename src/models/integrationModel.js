import FirebaseModel from '../utils/firebaseModel.js';

/**
 * Integration Schema Definition
 * Stores third-party connection data separately from user profile
 */
const integrationSchema = {
    userId: {
        type: String,
        required: true,
        unique: true
    },
    github: {
        type: Object,
        default: null
    },
    linkedin: {
        type: Object,
        default: null
    },
    updatedAt: {
        type: Date,
        default: () => new Date()
    }
};

const Integration = new FirebaseModel('integrations', integrationSchema);

/**
 * Custom Method: Find by userId
 */
Integration.findByUserId = async function(userId) {
    return this.findOne({ userId });
};

export default Integration;
