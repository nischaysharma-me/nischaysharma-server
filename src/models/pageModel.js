import FirebaseModel from '../utils/firebaseModel.js';

/**
 * Page (or Chapter) Schema Definition
 */
const pageSchema = {
    bookId: {
        type: String,
        required: true
    },
    chapterId: {
        type: String, // Reference to the chapter within the book's chapters array
        required: true
    },
    content: {
        type: String, // Markdown/HTML content
        required: true
    },
    images: {
        type: Array, // Array of image URLs embedded or associated with this page
        default: []
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    lastDraftedFromMessageId: {
        type: String, // Tracks the conversation message context used to generate this page
        default: null
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

const Page = new FirebaseModel('pages', pageSchema);

/**
 * Custom Method: Retrieves all pages for a specific book
 * @param {string} bookId
 * @returns {Promise<Array>}
 */
Page.getByBookId = async function(bookId) {
    return this.find({ bookId }, { sort: { createdAt: 'asc' } });
};

export default Page;
