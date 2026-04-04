import FirebaseModel from '../utils/firebaseModel.js';

/**
 * User Profile Schema Definition (Mongoose-style)
 */
const userProfileSchema = {
    uid: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    displayName: {
        type: String,
        required: true,
        trim: true
    },
    photoURL: {
        type: String,
        trim: true
    },
    coverURL: {
        type: String,
        trim: true
    },
    occupation: {
        type: String,
        trim: true
    },
    bio: {
        type: String,
        maxlength: 1000,
        trim: true
    },
    skills: {
        type: Array,
        default: []
    },
    projects: {
        type: Array, // Array of { title, description, link }
        default: []
    },
    expertise: {
        type: Array,
        default: [] // Areas the user is knowledgeable in
    },
    gallery: {
        type: Array, // Array of { url, type: 'photo'|'video', title, createdAt }
        default: []
    },
    featured: {
        type: Array, // Array of { type: 'article'|'image'|'video', id, title, url }
        default: []
    },
    hobbies: {
        type: Array,
        default: []
    },
    interests: {
        type: Array,
        default: []
    },
    writingStyle: {
        type: String,
        enum: ['professional', 'casual', 'technical', 'witty', 'academic', 'storyteller'],
        default: 'casual'
    },
    socialLinks: {
        type: Object,
        default: {
            twitter: '',
            linkedin: '',
            github: '',
            website: ''
        }
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator'],
        default: 'user'
    },
    preferences: {
        type: Object,
        default: {
            theme: 'dark',
            notifications: true,
            language: 'en'
        }
    },
    integrations: {
        type: Object,
        default: {}
    },
    analytics: {
        type: Object,
        default: {
            github: null,   // Stores processed githubAnalyticsSchema
            linkedin: null  // Stores processed linkedinAnalyticsSchema
        }
    },
    organizationId: {
        type: String, // Link to Organization Model
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'deactivated', 'disabled'],
        default: 'active'
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

// Instantiate directly (No class extension)
const User = new FirebaseModel('users', userProfileSchema);

/**
 * Custom Method: Find user by email
 * Attaching directly to the instance
 */
User.findByEmail = async function(email) {
    return this.findOne({ email });
};

export default User;
