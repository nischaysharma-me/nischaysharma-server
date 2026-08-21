import FirebaseModel from '../utils/firebaseModel.js';

/**
 * StackItem Schema Definition
 * Stores items for the 3D stacked menu
 */
const stackItemSchema = {
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    linkType: {
        type: String,
        enum: ['internal', 'external'],
        default: 'internal'
    },
    imageUrl: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    icon: {
        type: String,
        default: 'ph-link'
    },
    color: {
        type: String,
        default: '#000000'
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
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

const StackItem = new FirebaseModel('stack_items', stackItemSchema);

export default StackItem;
