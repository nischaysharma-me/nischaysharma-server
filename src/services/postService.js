import { Post } from '../models/index.js';
import * as aiService from './aiService.js';
import { renderPrompt } from './promptLibraryService.js';
import { normalizeGeneratedPost } from '../utils/postGeneration.js';
import * as storageService from './storageService.js';
import logger from '../utils/logger.js';
import fetch from 'node-fetch';

function generatedImageStoragePath(url, authorId) {
    try {
        const parsed = new URL(url);
        const prefix = '/nischaysharma-com.firebasestorage.app/';
        const ownedPrefix = `users/${authorId}/post_images/`;
        if (parsed.hostname !== 'storage.googleapis.com' || !parsed.pathname.startsWith(prefix)) return null;
        const path = decodeURIComponent(parsed.pathname.slice(prefix.length));
        return path.startsWith(ownedPrefix) ? path : null;
    } catch {
        return null;
    }
}

async function deleteGeneratedImage(url, authorId) {
    const path = generatedImageStoragePath(url, authorId);
    if (!path) return;
    try {
        await storageService.deleteFile(path);
    } catch (error) {
        logger.warn(`PostService: Unable to delete generated image ${path}: ${error.message}`);
    }
}

async function createPost(authorId, data) {
    const now = new Date();
    return Post.create({
        ...data,
        authorId,
        publishedAt: data.status === 'published' ? now : null
    });
}

async function generatePost(authorId, { topic, tone, instructions }) {
    const prompt = await renderPrompt('post.generate', {
        topic,
        tone,
        instructions: instructions || 'No additional instructions.'
    });
    const result = await aiService.generateText(prompt, {
        responseMimeType: 'application/json',
        temperature: 0.75
    });
    const draft = normalizeGeneratedPost(result, topic);
    return createPost(authorId, { ...draft, status: 'draft' });
}

async function generatePostImage(id, authorId, visualDirection = '') {
    const post = await getOwnedPost(id, authorId);
    const prompt = await renderPrompt('post.image', {
        title: post.title,
        content: post.content,
        tags: (post.tags || []).join(', ') || 'No tags',
        visualDirection: visualDirection || 'Choose the strongest visual metaphor from the post.'
    });
    const imageResult = await aiService.generateImage(prompt, {
        aspectRatio: '4:5',
        imageSize: '2K'
    });
    const image = imageResult?.images?.[0];
    if (!imageResult?.success || !image) throw new Error('AI did not return a post image');

    let buffer;
    let mimeType;
    if (typeof image === 'string') {
        const response = await fetch(image);
        if (!response.ok) throw new Error('Generated post image could not be downloaded');
        buffer = Buffer.from(await response.arrayBuffer());
        mimeType = response.headers.get('content-type') || 'image/jpeg';
    } else if (image.inlineData?.data) {
        buffer = Buffer.from(image.inlineData.data, 'base64');
        mimeType = image.inlineData.mimeType || 'image/jpeg';
    }
    if (!buffer) throw new Error('Generated post image was empty');

    const upload = await storageService.uploadUserAsset(authorId, buffer, mimeType, 'post_images');
    const updated = await Post.findByIdAndUpdate(id, {
        imageUrl: upload.url,
        imageAltText: post.imageAltText || `Editorial illustration for ${post.title}`
    }, { new: true });
    if (post.imageUrl && post.imageUrl !== upload.url) await deleteGeneratedImage(post.imageUrl, authorId);
    return updated;
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

    const updated = await Post.findByIdAndUpdate(id, next, { new: true });
    if (updates.imageUrl !== undefined && updates.imageUrl !== current.imageUrl) {
        await deleteGeneratedImage(current.imageUrl, authorId);
    }
    return updated;
}

async function publishPost(id, authorId) {
    await getOwnedPost(id, authorId);
    return Post.findByIdAndUpdate(id, {
        status: 'published',
        publishedAt: new Date()
    }, { new: true });
}

async function deletePost(id, authorId) {
    const post = await getOwnedPost(id, authorId);
    await deleteGeneratedImage(post.imageUrl, authorId);
    return Post.findByIdAndDelete(id);
}

export {
    createPost,
    generatePost,
    generatePostImage,
    getPostById,
    listPosts,
    updatePost,
    publishPost,
    deletePost
};
