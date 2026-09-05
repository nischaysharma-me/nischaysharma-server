import Joi from 'joi';
import { ARTICLE_TEMPLATE_CATEGORY_LIST } from '../config/articleTemplates.js';

export const createArticleSchema = Joi.object({
    title: Joi.string().trim().required().min(3).max(200),
    description: Joi.string().trim().max(500).allow(''),
    content: Joi.string().trim().min(1).required(),
    tags: Joi.array().items(Joi.string()).min(20),
    status: Joi.string().valid('draft', 'published').default('draft'),
    access: Joi.string().valid('free', 'paid_single', 'subscription_author', 'subscription_platform').default('free'),
    price: Joi.number().min(0),
    currency: Joi.string().default('USD'),
    preview: Joi.string().allow(''),
    backgroundImage: Joi.string().uri().allow(''),
    imagesAttached: Joi.array().items(Joi.string().uri()),
    references: Joi.array().items(Joi.object({
        title: Joi.string(),
        url: Joi.string().uri()
    })),
    isFavorite: Joi.boolean().default(false)
});

export const updateArticleSchema = Joi.object({
    title: Joi.string().trim().min(3).max(200),
    description: Joi.string().trim().max(500).allow(''),
    content: Joi.string().trim().min(1),
    tags: Joi.array().items(Joi.string()).min(20),
    status: Joi.string().valid('draft', 'published', 'archived'),
    access: Joi.string().valid('free', 'paid_single', 'subscription_author', 'subscription_platform'),
    price: Joi.number().min(0),
    preview: Joi.string().allow(''),
    backgroundImage: Joi.string().uri().allow(''),
    imagesAttached: Joi.array().items(Joi.string().uri()),
    references: Joi.array().items(Joi.object({
        title: Joi.string(),
        url: Joi.string().uri()
    })),
    isFavorite: Joi.boolean()
});

export const addReviewSchema = Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().max(1000).allow('')
});

export const generateArticleSchema = Joi.object({
    topic: Joi.string().required().min(3).max(500),
    depth: Joi.string().valid('standard', 'deep-dive').default('standard'),
    instructions: Joi.string().max(1000).allow(''),
    templateId: Joi.string().allow(null)
});

export const generateTemplateSchema = Joi.object({
    description: Joi.string().required().min(10).max(1000),
    category: Joi.string().valid(...ARTICLE_TEMPLATE_CATEGORY_LIST).default('blog-post')
});

export const regenerateBackgroundImageSchema = Joi.object({
    prompt: Joi.string().max(1000).allow('')
});
