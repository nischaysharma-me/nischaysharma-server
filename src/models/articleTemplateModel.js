import FirebaseModel from '../utils/firebaseModel.js';
import { ARTICLE_TEMPLATE_CATEGORY_LIST } from '../config/articleTemplates.js';

/**
 * Article Template Schema Definition
 */
const articleTemplateSchema = {
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        enum: ARTICLE_TEMPLATE_CATEGORY_LIST,
        default: 'blog-post'
    },
    // The skeleton of the article
    structure: {
        type: Array, // Array of section objects: { heading: string, contentBrief: string, imagePrompt: string }
        required: true
    },
    // Guidance for AI generation
    aiInstructions: {
        type: String,
        default: ''
    },
    authorId: {
        type: String, // UID of the creator
        required: true
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    usageCount: {
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

const ArticleTemplate = new FirebaseModel('article_templates', articleTemplateSchema);

/**
 * Custom Method: Find public templates by category
 */
ArticleTemplate.findPublicByCategory = async function(category) {
    return this.find({ category, isPublic: true });
};

export default ArticleTemplate;
