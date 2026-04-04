import Joi from 'joi';

export const createBillboardSchema = Joi.object({
    label: Joi.string().required().min(1).max(50),
    headline: Joi.string().required().min(3).max(200),
    summary: Joi.string().allow('').max(500),
    href: Joi.string().required().max(500),
    imagePrompt: Joi.string().allow('').max(1000),
    imageUrl: Joi.string().uri().allow(''),
    layoutType: Joi.string().valid('lead', 'middle', 'mini').default('mini'),
    position: Joi.number().integer().default(0),
    isActive: Joi.boolean().default(true)
});

export const updateBillboardSchema = Joi.object({
    label: Joi.string().min(1).max(50),
    headline: Joi.string().min(3).max(200),
    summary: Joi.string().allow('').max(500),
    href: Joi.string().max(500),
    imagePrompt: Joi.string().allow('').max(1000),
    imageUrl: Joi.string().uri().allow(''),
    layoutType: Joi.string().valid('lead', 'middle', 'mini'),
    position: Joi.number().integer(),
    isActive: Joi.boolean()
});

export const generateBillboardImageSchema = Joi.object({
    prompt: Joi.string().allow('').max(1000)
});
