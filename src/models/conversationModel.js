import FirebaseModel from '../utils/firebaseModel.js';

/**
 * Conversation Schema Definition
 */
const conversationSchema = {
    userId: {
        type: String,
        required: true
    },
    bookId: {
        type: String, // Optional reference to the book being collaboratively authored
        default: null
    },
    articleId: {
        type: String, // Optional reference to the article being collaboratively authored
        default: null
    },
    title: {
        type: String,
        trim: true,
        maxlength: 200,
        default: 'New Conversation'
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    messages: {
        type: Array, // Array of { role, content, timestamp }
        default: []
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

const Conversation = new FirebaseModel('conversations', conversationSchema);

/**
 * Custom Method: Retrieves all conversations for a specific user
 * @param {string} userId
 * @returns {Promise<Array>}
 */
Conversation.getByUserId = async function(userId) {
    return this.find({ userId }, { sort: { updatedAt: 'desc' } });
};

/**
 * Custom Method: Add a message to a thread
 * @param {string} threadId
 * @param {object} message { role, content, timestamp }
 */
Conversation.addMessage = async function(threadId, message) {
    const thread = await this.findById(threadId);
    if (!thread) throw new Error('Conversation not found');

    const updatedMessages = [...(thread.messages || []), {
        ...message,
        timestamp: message.timestamp || new Date().toISOString()
    }];

    return this.findByIdAndUpdate(threadId, {
        messages: updatedMessages,
        updatedAt: new Date()
    }, { new: true });
};

export default Conversation;
