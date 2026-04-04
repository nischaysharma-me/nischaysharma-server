import * as userService from '../services/userProfileService.js';
import * as storageService from '../services/storageService.js';
import Organization from '../models/organizationModel.js';
import logger from '../utils/logger.js';

/**
 * Onboard a new user
 */
const onboardUser = async (req, res) => {
    try {
        const { uid } = req.user;
        const profileData = req.body;
        const file = req.file;

        const newUser = await userService.onboardUser(uid, profileData, file);

        res.status(201).json({
            success: true,
            data: newUser
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get current user profile
 */
const getMe = async (req, res) => {
    try {
        const user = await userService.getMe(req.user.uid);
        
        if (!user && req.user) {
            return res.json({
                success: true,
                data: {
                    ...req.user,
                    isOnboarded: false
                }
            });
        }

        res.json({ success: true, data: user });
    } catch (error) {
        res.status(404).json({ success: false, error: error.message });
    }
};

/**
 * Get user by ID (Admin or public profile depending on logic)
 */
const getUserById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(404).json({ success: false, error: error.message });
    }
};

/**
 * Get public admin profile
 */
const getPublicAdminProfile = async (req, res) => {
    try {
        const user = await userService.getPrimaryAdmin();
        if (!user) {
            return res.status(404).json({ success: false, error: 'Admin profile not found' });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Update user profile
 */
const updateUser = async (req, res) => {
    try {
        const { uid } = req.user;
        const updates = req.body;

        const updatedUser = await userService.updateUser(uid, updates);
        res.json({ success: true, data: updatedUser });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

/**
 * List all users (Admin only likely)
 */
const getAllUsers = async (req, res) => {
    try {
        const filters = req.query; // Basic filtering from query params
        const users = await userService.listUsers(filters);
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Deactivate User (Soft Delete)
 * User cannot log in but data persists
 */
const deactivateUser = async (req, res) => {
    try {
        const { id } = req.params;
        // Verify permission (Admin or Self)
        if (req.user.uid !== id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

        await userService.deleteUserById(id);
        res.json({ success: true, message: 'User deactivated' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Disable User (Admin Ban)
 * User cannot access anything
 */
const disableUser = async (req, res) => {
    try {
        // Admin only
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

        const { id } = req.params;
        await userService.updateUserById(id, { status: 'disabled' });
        res.json({ success: true, message: 'User disabled' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Activate User
 */
const activateUser = async (req, res) => {
    try {
        // Admin only
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

        const { id } = req.params;
        await userService.updateUserById(id, { status: 'active' });
        res.json({ success: true, message: 'User activated' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Update Profile Picture
 */
const updateProfilePicture = async (req, res) => {
    try {
        const { uid } = req.user;
        if (!req.file) throw new Error('No image file provided');

        const updatedUser = await userService.updateProfilePicture(
            uid,
            req.file.buffer,
            req.file.mimetype
        );

        res.json({ success: true, data: updatedUser });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

/**
 * Update Cover Photo
 */
const updateCoverPhoto = async (req, res) => {
    try {
        const { uid } = req.user;
        if (!req.file) throw new Error('No image file provided');

        const updatedUser = await userService.updateCoverPhoto(
            uid,
            req.file.buffer,
            req.file.mimetype
        );

        res.json({ success: true, data: updatedUser });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

/**
 * Add Asset to Gallery
 */
const addGalleryAsset = async (req, res) => {
    try {
        const { uid } = req.user;
        const metadata = req.body;
        if (!req.file) throw new Error('No file provided');

        const updatedUser = await userService.addGalleryAsset(
            uid,
            req.file.buffer,
            req.file.mimetype,
            metadata
        );

        res.json({ success: true, data: updatedUser });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

/**
 * Delete Asset from Gallery
 */
const deleteGalleryAsset = async (req, res) => {
    try {
        const { uid } = req.user;
        const { assetUrl } = req.body;
        if (!assetUrl) throw new Error('Asset URL is required');

        const updatedUser = await userService.deleteGalleryAsset(uid, assetUrl);
        res.json({ success: true, data: updatedUser });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

export {
    onboardUser,
    getMe,
    getPublicAdminProfile,
    getUserById,
    updateUser,
    getAllUsers,
    deactivateUser,
    disableUser,
    activateUser,
    updateProfilePicture,
    updateCoverPhoto,
    addGalleryAsset,
    deleteGalleryAsset
};