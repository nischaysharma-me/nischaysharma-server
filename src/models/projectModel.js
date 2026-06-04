import FirebaseModel from '../utils/firebaseModel.js';

/**
 * Project Schema Definition
 */
const projectSchema = {
    userId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: ''
    },
    link: {
        type: String,
        default: ''
    },
    tags: {
        type: Array,
        default: []
    },
    skills: {
        type: Array,
        default: []
    },
    relatedArticles: {
        type: Array, // Array of Article IDs
        default: []
    },
    resources: {
        type: Array, // Array of { title, url }
        default: []
    },
    isFeatured: {
        type: Boolean,
        default: true
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

const Project = new FirebaseModel('projects', projectSchema);

export default Project;
