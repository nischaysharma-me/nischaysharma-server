import { User, Article, Book, Project, Experience, Education } from '../models/index.js';
import logger from '../utils/logger.js';
import * as storageService from './storageService.js';

/**
 * Update user profile by UID (Creates if doesn't exist)
 * @param {string} uid 
 * @param {Object} updateData 
 */
async function updateUser(uid, updateData) {
    let profile = await User.findOne({ uid });
    
    if (profile && profile.status === 'deactivated') {
        throw new Error('Profile is deactivated');
    }

    // 1. Prevent updating sensitive system fields directly
    delete updateData.uid;
    // Only admins can update role/status via this method if we wanted, 
    // but for now, let's keep it restricted.
    delete updateData.role;
    delete updateData.status;

    // 2. If profile doesn't exist, create it (Onboarding merge)
    if (!profile) {
        logger.info(`UserService: Creating new profile for user ${uid}`);
        profile = await User.create({
            uid,
            ...updateData,
            role: 'user',
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        });
        return profile;
    }

    // 3. Handle Integrations and modular components (Redirect to separate collections)
    delete updateData.integrations;
    delete updateData.experience;
    delete updateData.education;
    delete updateData.projects;

    const updatedProfile = await User.findByIdAndUpdate(
        profile.id,
        {
            ...updateData,
            updatedAt: new Date()
        },
        { new: true }
    );

    return updatedProfile;
}

/**
 * Get current user profile
 * @param {string} uid 
 */
async function getMe(uid) {
    let user = await getUser(uid);
    return user;
}

/**
 * Get user profile by UID (field)
 * @param {string} uid 
 */
async function getUser(uid) {
    const profile = await User.findOne({ uid });
    
    if (!profile || profile.status === 'deactivated') {
        return null;
    }

    return profile;
}

/**
 * Get user profile by Doc ID
 * @param {string} id 
 */
async function getUserById(id) {
    const profile = await User.findById(id);
    
    if (!profile || profile.status === 'deactivated') {
        return null;
    }

    return profile;
}

/**
 * Update user profile by Doc ID
 * @param {string} id 
 * @param {Object} updateData 
 */
async function updateUserById(id, updateData) {
    const profile = await User.findById(id);
    
    if (!profile || profile.status === 'deactivated') {
        throw new Error('Profile not found');
    }

    const updatedProfile = await User.findByIdAndUpdate(
        id,
        {
            ...updateData,
            updatedAt: new Date()
        },
        { new: true }
    );

    return updatedProfile;
}

/**
 * Deactivate user profile by UID
 * @param {string} uid 
 */
async function deleteUser(uid) {
    const profile = await User.findOne({ uid });
    
    if (!profile || profile.status === 'deactivated') {
        throw new Error('Profile not found');
    }

    const deactivatedProfile = await User.findByIdAndUpdate(
        profile.id,
        {
            status: 'deactivated',
            updatedAt: new Date()
        },
        { new: true }
    );

    return deactivatedProfile;
}

/**
 * Delete user profile by Doc ID
 * @param {string} id 
 */
async function deleteUserById(id) {
    const profile = await User.findById(id);
    
    if (!profile || profile.status === 'deactivated') {
        throw new Error('Profile not found');
    }

    const deactivatedProfile = await User.findByIdAndUpdate(
        id,
        {
            status: 'deactivated',
            updatedAt: new Date()
        },
        { new: true }
    );

    return deactivatedProfile;
}

/**
 * Update last active timestamp
 * @param {string} uid 
 */
async function updateLastActive(uid) {
    const profile = await User.findOne({ uid });
    
    if (!profile || profile.status === 'deactivated') {
        return null;
    }

    const updatedProfile = await User.findByIdAndUpdate(
        profile.id,
        {
            lastActiveAt: new Date()
        },
        { new: true }
    );

    return updatedProfile;
}

/**
 * Check if a display name is taken
 * @param {string} displayName 
 */
async function isDisplayNameTaken(displayName) {
    const users = await User.find({ displayName });
    return users.length > 0;
}

/**
 * List users with filters
 * @param {Object} query 
 * @param {Object} options 
 */
async function listUsers(query = {}, options = {}) {
    return await User.find(
        { ...query, status: 'active' },
        options
    );
}

/**
 * Get the primary admin profile (for public landing page)
 */
async function getPrimaryAdmin() {
    const admins = await User.find({ role: 'admin', status: 'active' }, { limit: 1 });
    return admins[0] || null;
}

/**
 * Update user's profile picture
 * @param {string} uid 
 * @param {Buffer} fileBuffer 
 * @param {string} mimeType 
 */
async function updateProfilePicture(uid, fileBuffer, mimeType) {
    const user = await getUser(uid);
    if (!user) throw new Error('User not found');

    const filename = `profile_${Date.now()}.${mimeType.split('/')[1]}`;
    const uploadResult = await storageService.uploadUserAsset(
        user.uid,
        fileBuffer,
        mimeType,
        'profile',
        filename
    );

    return await updateUser(uid, { photoURL: uploadResult.url });
}

/**
 * Update user's cover photo
 * @param {string} uid 
 * @param {Buffer} fileBuffer 
 * @param {string} mimeType 
 */
async function updateCoverPhoto(uid, fileBuffer, mimeType) {
    const user = await getUser(uid);
    if (!user) throw new Error('User not found');

    const filename = `cover_${Date.now()}.${mimeType.split('/')[1]}`;
    const uploadResult = await storageService.uploadUserAsset(
        user.uid,
        fileBuffer,
        mimeType,
        'profile',
        filename
    );

    return await updateUser(uid, { coverURL: uploadResult.url });
}

/**
 * Add an asset to the user's gallery
 * @param {string} uid 
 * @param {Buffer} fileBuffer 
 * @param {string} mimeType 
 * @param {Object} metadata { title, description, type: 'photo'|'video' }
 */
async function addGalleryAsset(uid, fileBuffer, mimeType, metadata = {}) {
    const user = await getUser(uid);
    if (!user) throw new Error('User not found');

    const fileType = metadata.type || (mimeType.startsWith('video') ? 'video' : 'photo');
    const filename = `gallery_${Date.now()}.${mimeType.split('/')[1]}`;
    
    const uploadResult = await storageService.uploadUserAsset(
        user.uid,
        fileBuffer,
        mimeType,
        'gallery',
        filename
    );

    const newAsset = {
        url: uploadResult.url,
        type: fileType,
        title: metadata.title || '',
        description: metadata.description || '',
        createdAt: new Date()
    };

    const updatedGallery = [...(user.gallery || []), newAsset];
    return await updateUser(uid, { gallery: updatedGallery });
}

/**
 * Remove an asset from the user's gallery
 * @param {string} uid 
 * @param {string} assetUrl 
 */
async function deleteGalleryAsset(uid, assetUrl) {
    const user = await getUser(uid);
    if (!user) throw new Error('User not found');

    // 1. Delete from storage if it's our storage
    if (assetUrl.includes('storage.googleapis.com')) {
        try {
            const urlObj = new URL(assetUrl);
            const path = urlObj.pathname.split('/').slice(2).join('/');
            await storageService.deleteFile(path);
        } catch (e) {
            logger.warn(`Failed to delete gallery file from storage: ${assetUrl}`);
        }
    }

    // 2. Remove from database
    const updatedGallery = (user.gallery || []).filter(item => item.url !== assetUrl);
    return await updateUser(uid, { gallery: updatedGallery });
}

/**
 * Populate featured items with full data (Article/Book)
 * @param {Object} user 
 */
async function populateFeaturedItems(user) {
    if (!user || !user.featured || !Array.isArray(user.featured)) {
        return [];
    }

    const populatedItems = await Promise.all(user.featured.map(async (item) => {
        try {
            let data = null;
            if (item.type === 'article') {
                data = await Article.findById(item.id);
            } else if (item.type === 'book') {
                data = await Book.findById(item.id);
            } else if (item.type === 'project') {
                data = await Project.findById(item.id);
                // Fallback to legacy projects if not found in collection
                if (!data && user.projects) {
                    data = user.projects.find(p => p.id === item.id || p.title === item.title);
                }
            }
            
            if (data) {
                return {
                    ...item,
                    data
                };
            }
            return null;
        } catch (error) {
            logger.warn(`Failed to populate featured item: ${item.id}`, error);
            return null;
        }
    }));

    return populatedItems.filter(item => item !== null);
}

/**
 * Get consolidated data for the public home page
 */
async function getHomeData() {
    const admin = await getPrimaryAdmin();
    if (!admin) {
        return {
            profile: null,
            featured: []
        };
    }

    let featured = await populateFeaturedItems(admin);

    // Fetch all separate components for the profile
    const userId = admin.uid || admin.id;
    const [projectsCollection, experience, education] = await Promise.all([
        Project.find({ userId }),
        Experience.find({ userId }),
        Education.find({ userId })
    ]);

    // Merge legacy projects with collection projects (de-duplicate by title)
    const legacyProjects = admin.projects || [];
    const projectsMap = new Map();
    
    // Add legacy ones first
    legacyProjects.forEach(p => {
        if (p && p.title) projectsMap.set(p.title.toLowerCase(), p);
    });
    
    // Override with new collection data (more up to date)
    projectsCollection.forEach(p => {
        if (p && p.title) projectsMap.set(p.title.toLowerCase(), p);
    });

    // Merge legacy experience (de-duplicate by company)
    const legacyExperience = admin.experience || [];
    const expMap = new Map();
    legacyExperience.forEach(e => {
        if (e && e.company) {
            const key = e.company.toLowerCase();
            expMap.set(key, {
                ...e,
                roles: e.roles || [{ title: e.title, startDate: e.startDate, endDate: e.endDate, description: e.description }]
            });
        }
    });
    experience.forEach(e => {
        if (e && e.company) expMap.set(e.company.toLowerCase(), e);
    });

    // Merge legacy education (de-duplicate by school)
    const legacyEducation = admin.education || [];
    const eduMap = new Map();
    legacyEducation.forEach(e => {
        if (e && e.school) {
            const key = `${e.school}-${e.degree || ''}`.toLowerCase();
            eduMap.set(key, e);
        }
    });
    education.forEach(e => {
        if (e && e.school) {
            const key = `${e.school}-${e.degree || ''}`.toLowerCase();
            eduMap.set(key, e);
        }
    });

    const enrichedProfile = {
        ...admin,
        projects: Array.from(projectsMap.values()),
        experience: Array.from(expMap.values()),
        education: Array.from(eduMap.values())
    };

    // Fallback: If no featured items, get latest published articles
    if (featured.length === 0) {
        const latestArticles = await Article.find({ status: 'published' }, { limit: 10, sort: { createdAt: -1 } });
        featured = latestArticles.map(article => ({
            id: article.id,
            type: 'article',
            title: article.title,
            data: article
        }));
    }

    return {
        profile: enrichedProfile,
        featured
    };
}

export {
    getMe,
    getUser,
    getUserById,
    updateUser,
    updateUserById,
    deleteUser,
    deleteUserById,
    updateLastActive,
    isDisplayNameTaken,
    listUsers,
    getPrimaryAdmin,
    updateProfilePicture,
    updateCoverPhoto,
    addGalleryAsset,
    deleteGalleryAsset,
    populateFeaturedItems,
    getHomeData
};