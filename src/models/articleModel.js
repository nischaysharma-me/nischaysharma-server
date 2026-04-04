import FirebaseModel from '../utils/firebaseModel.js';

/**
 * Article Schema Definition
 */
const articleSchema = {
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 200
    },
    slug: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    content: {
        type: String, // HTML or Markdown content
        required: true
    },
    preview: {
        type: String, // Short excerpt for locked content
        default: ''
    },
    backgroundImage: {
        type: String, // Background Image URL
        default: ''
    },
    imagesAttached: {
        type: Array, // Array of image URLs
        default: []
    },
    authorId: {
        type: String, // Reference to User uid
        required: true
    },
    templateId: {
        type: String, // Reference to ArticleTemplate id
        default: null
    },
    references: {
        type: Array, // Array of reference objects or strings
        default: []
    },
    relatedArticles: {
        type: Array, // Array of Article IDs
        default: []
    },
    tags: {
        type: Array,
        default: []
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    // Monetization & Access Control
    access: {
        type: String,
        enum: ['free', 'paid_single', 'subscription_author', 'subscription_platform'],
        default: 'free'
    },
    price: {
        type: Number, // Cost if access is 'paid_single'
        default: 0
    },
    currency: {
        type: String,
        default: 'USD'
    },
    subscriptionTier: {
        type: String, // Required tier if access is 'subscription_platform' (e.g., 'premium', 'pro')
        default: null
    },
    
    // Engagement Metrics (denormalized for simple sorting)
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    
    createdAt: {
        type: Date,
        default: () => new Date()
    },
    updatedAt: {
        type: Date,
        default: () => new Date()
    },
    publishedAt: {
        type: Date,
        default: null
    }
};

const Article = new FirebaseModel('articles', articleSchema);

/**
 * Custom Method: Find published articles by author
 */
Article.findByAuthor = async function(authorId) {
    return this.find({ authorId, status: 'published' });
};

/**
 * Custom Method: Find article by slug
 */
Article.findBySlug = async function(slug) {
    return this.findOne({ slug });
};

export default Article;
