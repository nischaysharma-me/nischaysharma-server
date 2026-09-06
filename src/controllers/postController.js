import * as postService from '../services/postService.js';

function sendError(res, error, fallbackStatus = 400) {
    if (error.message === 'Unauthorized') {
        return res.status(403).json({ success: false, error: error.message });
    }
    if (error.message === 'Post not found') {
        return res.status(404).json({ success: false, error: error.message });
    }
    return res.status(fallbackStatus).json({ success: false, error: error.message });
}

export async function createPost(req, res) {
    try {
        const post = await postService.createPost(req.user.uid, req.body);
        res.status(201).json({ success: true, data: post });
    } catch (error) {
        sendError(res, error);
    }
}

export async function generatePost(req, res) {
    try {
        const post = await postService.generatePost(req.user.uid, req.body);
        res.status(201).json({ success: true, data: post });
    } catch (error) {
        sendError(res, error, 500);
    }
}

export async function listPosts(req, res) {
    try {
        const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
        const skip = Math.max(Number.parseInt(req.query.skip, 10) || 0, 0);
        const filters = {};

        const isOwnedListing = Boolean(req.user && req.query.scope === 'mine');
        if (isOwnedListing) {
            filters.authorId = req.user.uid;
            if (req.query.status) filters.status = req.query.status;
        } else {
            filters.status = 'published';
        }

        const posts = await postService.listPosts(filters, {
            limit,
            skip,
            sort: isOwnedListing ? { createdAt: -1 } : { publishedAt: -1 }
        });
        res.json({ success: true, data: posts });
    } catch (error) {
        sendError(res, error, 500);
    }
}

export async function getPost(req, res) {
    try {
        const post = await postService.getPostById(req.params.id);
        const isOwner = req.user?.uid === post.authorId;
        if (post.status !== 'published' && !isOwner) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }
        res.json({ success: true, data: post });
    } catch (error) {
        sendError(res, error);
    }
}

export async function updatePost(req, res) {
    try {
        const post = await postService.updatePost(req.params.id, req.user.uid, req.body);
        res.json({ success: true, data: post });
    } catch (error) {
        sendError(res, error);
    }
}

export async function publishPost(req, res) {
    try {
        const post = await postService.publishPost(req.params.id, req.user.uid);
        res.json({ success: true, data: post });
    } catch (error) {
        sendError(res, error);
    }
}

export async function deletePost(req, res) {
    try {
        await postService.deletePost(req.params.id, req.user.uid);
        res.json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
        sendError(res, error);
    }
}
