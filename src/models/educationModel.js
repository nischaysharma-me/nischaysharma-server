import FirebaseModel from '../utils/firebaseModel.js';

/**
 * Academic Background Schema
 */
const educationSchema = {
    userId: {
        type: String,
        required: true
    },
    school: {
        type: String,
        required: true
    },
    degree: {
        type: String,
        required: true
    },
    fieldOfStudy: {
        type: String
    },
    startDate: {
        type: String
    },
    endDate: {
        type: String
    },
    logo: {
        type: String
    },
    description: {
        type: String
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

const Education = new FirebaseModel('education', educationSchema);

export default Education;
