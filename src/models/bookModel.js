import FirebaseModel from '../utils/firebaseModel.js';

/**
 * Book Schema Definition
 */
const bookSchema = {
    userId: {
        type: String,
        required: true
    },
    threadId: {
        type: String,
        default: null
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
        default: 'Untitled Book'
    },
    description: {
        type: String,
        trim: true,
        maxlength: 2000,
        default: ''
    },
    coverImage: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    type: {
        type: String,
        enum: ['book', 'paper'], // 'book' has named chapters, 'paper' has one nameless chapter
        default: 'book'
    },
    chapters: {
        type: Array, // Array of { id, title, pageIds: [] }
        default: []
    },
    metadata: {
        type: Object, // tags, category, etc.
        default: {}
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

const Book = new FirebaseModel('books', bookSchema);

/**
 * Custom Method: Retrieves all books for a specific user
 * @param {string} userId
 * @returns {Promise<Array>}
 */
Book.getByUserId = async function(userId) {
    return this.find({ userId }, { sort: { updatedAt: 'desc' } });
};

export default Book;
