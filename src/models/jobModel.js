import FirebaseModel from '../utils/firebaseModel.js';

const jobSchema = {
    type: {
        type: String,
        required: true
    },
    data: {
        type: Object,
        required: true
    },
    result: {
        type: Object,
        default: null
    },
    status: {
        type: String,
        enum: ['queued', 'processing', 'completed', 'failed'],
        default: 'queued'
    },
    progress: {
        type: Number,
        default: 0
    },
    error: {
        type: String,
        default: null
    },
    userId: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: () => new Date()
    },
    updatedAt: {
        type: Date,
        default: () => new Date()
    },
    completedAt: {
        type: Date,
        default: null
    }
};

const Job = new FirebaseModel('jobs', jobSchema);

export default Job;
