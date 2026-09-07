import FirebaseModel from '../utils/firebaseModel.js';

const postSchema = {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 160 },
    content: { type: String, required: true, trim: true, minlength: 1, maxlength: 10000 },
    imageUrl: { type: String, default: '' },
    imageAltText: { type: String, default: '', maxlength: 300 },
    tags: { type: Array, default: [] },
    authorId: { type: String, required: true },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date, default: () => new Date() },
    publishedAt: { type: Date, default: null }
};

export default new FirebaseModel('posts', postSchema);
