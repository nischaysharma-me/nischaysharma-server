# How to Create a Service

Services are the **Brain** of your application. They hold the business logic.

## Rules of the Game

1.  **Transport Agnostic**: Services don't know about `req`, `res`, or HTTP status codes. They just take arguments and return data (or throw errors).
2.  **Functional Style**: We prefer exporting simple functions over classes.
3.  **Specific Purpose**: A service should do one thing well (e.g., `UserService` manages users, `StorageService` manages files).

## Example: Creating a Blog Service

Create `src/services/blogService.js`.

```javascript
import { Blog } from '../models/index.js';
import logger from '../utils/logger.js';

/**
 * Create a new blog post
 * @param {Object} blogData 
 * @returns {Promise<Object>}
 */
async function createPost(blogData) {
    // 1. Validation Logic
    if (blogData.title.includes('spam')) {
        throw new Error('No spam allowed!');
    }

    // 2. Data Preparation
    const payload = {
        ...blogData,
        slug: blogData.title.toLowerCase().replace(/ /g, '-')
    };

    logger.info(`Creating blog: ${payload.title}`);

    // 3. Database Interaction
    // create() generates a new document with an auto-generated ID
    return await Blog.create(payload);
}

/**
 * Get published posts
 */
async function getPublishedPosts() {
    return await Blog.find({ status: 'published' });
}

/**
 * Update a post by its slug (using findOneAndUpdate pattern)
 * @param {string} slug
 * @param {Object} updateData
 */
async function updatePostBySlug(slug, updateData) {
    // Find matching document and update it in one go
    const updatedPost = await Blog.findOneAndUpdate(
        { slug: slug },
        { ...updateData, updatedAt: new Date() },
        { new: true } // Return the updated document
    );
    
    if (!updatedPost) {
        throw new Error('Post not found');
    }
    
    return updatedPost;
}

// Export functions directly
export {
    createPost,
    getPublishedPosts,
    updatePostBySlug
};
```

## Why Functional?

It's simpler to test and easier to read. You import exactly what you need.

```javascript
import { createPost } from '../services/blogService.js';
// vs
// import blogService from '...'; blogService.createPost();
```