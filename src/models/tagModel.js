import FirebaseModel from '../utils/firebaseModel.js';

const tagSchema = {
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

const Tag = new FirebaseModel('tags', tagSchema);

Tag.findByName = async function(name) {
    // Basic implementation, ideally use slug for precise matching
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return this.findOne({ slug });
};

/**
 * Find or create a tag
 * If exists, increment usageCount
 * @param {string} name 
 */
Tag.findOrCreate = async function(name) {
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existing = await this.findOne({ slug });
    
    if (existing) {
        return this.findByIdAndUpdate(existing.id, {
            usageCount: (existing.usageCount || 0) + 1
        }, { new: true });
    }
    
    return this.create({
        name: name.trim(),
        slug,
        usageCount: 1
    });
};

export default Tag;
