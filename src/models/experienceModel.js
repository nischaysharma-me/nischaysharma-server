import FirebaseModel from '../utils/firebaseModel.js';

/**
 * Professional Experience Schema
 */
const experienceSchema = {
    userId: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    location: {
        type: String
    },
    logo: {
        type: String
    },
    roles: {
        type: Array, // Array of { title, startDate, endDate, description, employmentType }
        default: []
    },
    order: {
        type: Number,
        default: 0
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

const Experience = new FirebaseModel('experiences', experienceSchema);

export default Experience;
