import { Post } from '../models/index.js';

async function createPost(authorId, data) {
    const now = new Date();
    return Post.create({
        ...data,
        authorId,
        publishedAt: data.status === 'published' ? now : null
    });
}

async function getPostById(id) {
    const post = await Post.findById(id);
    if (!post) throw new Error('Post not found');
    return post;
}

async function getOwnedPost(id, authorId) {
    const post = await getPostById(id);
    if (post.authorId !== authorId) throw new Error('Unauthorized');
    return post;
}

async function listPosts(filters = {}, options = {}) {
    return Post.find(filters, options);
}

async function updatePost(id, authorId, updates) {
    const current = await getOwnedPost(id, authorId);
    const next = { ...updates };

    if (updates.status === 'published' && current.status !== 'published') {
        next.publishedAt = new Date();
    }
    if (updates.status && updates.status !== 'published') {
        next.publishedAt = null;
    }

    return Post.findByIdAndUpdate(id, next, { new: true });
}

async function publishPost(id, authorId) {
    await getOwnedPost(id, authorId);
    return Post.findByIdAndUpdate(id, {
        status: 'published',
        publishedAt: new Date()
    }, { new: true });
}

async function deletePost(id, authorId) {
    await getOwnedPost(id, authorId);
    return Post.findByIdAndDelete(id);
}

export {
    createPost,
    getPostById,
    listPosts,
    updatePost,
    publishPost,
    deletePost
};
