import Joi from 'joi';

export const updatePromptSchema = Joi.object({
    template: Joi.string().trim().min(1).max(100000).required()
});

export const previewPromptSchema = Joi.object({
    template: Joi.string().min(1).max(100000).required(),
    values: Joi.object().default({})
});
