import Joi from 'joi';

const postFields = {
    title: Joi.string().trim().min(3).max(160),
    content: Joi.string().trim().min(1).max(10000),
    imageUrl: Joi.string().uri().allow(''),
    imageAltText: Joi.string().trim().max(300).allow(''),
    tags: Joi.array().items(Joi.string().trim().min(1).max(40)).max(12),
    status: Joi.string().valid('draft', 'published', 'archived')
};

export const createPostSchema = Joi.object({
    ...postFields,
    title: postFields.title.required(),
    content: postFields.content.required(),
    status: Joi.string().valid('draft', 'published').default('draft')
});

export const updatePostSchema = Joi.object(postFields).min(1);

export const generatePostSchema = Joi.object({
    topic: Joi.string().trim().min(3).max(500).required(),
    tone: Joi.string().valid('professional', 'conversational', 'bold', 'reflective', 'educational').default('conversational'),
    instructions: Joi.string().trim().max(1000).allow('').default('')
});
