import Joi from 'joi';

export const updateUserSchema = Joi.object({
    email: Joi.string().email().optional(),
    displayName: Joi.string().min(2).max(50),
    occupation: Joi.string().allow(''),
    bio: Joi.string().max(1000).allow(''),
    skills: Joi.array().items(Joi.string()).optional(),
    projects: Joi.array().items(
        Joi.object({
            title: Joi.string().required(),
            description: Joi.string().allow(''),
            link: Joi.string().uri().allow('').optional()
        })
    ).optional(),
    hobbies: Joi.array().items(Joi.string()),
    interests: Joi.array().items(Joi.string()),
    expertise: Joi.array().items(Joi.string()),
    writingStyle: Joi.string().valid('professional', 'casual', 'technical', 'witty', 'academic', 'storyteller'),
    socialLinks: Joi.object({
        twitter: Joi.string().uri().optional().allow(''),
        linkedin: Joi.string().uri().optional().allow(''),
        github: Joi.string().uri().optional().allow(''),
        website: Joi.string().uri().optional().allow('')
    }),
    integrations: Joi.object().unknown(true).optional(),
    preferences: Joi.object({
        theme: Joi.string().valid('light', 'dark'),
        notifications: Joi.boolean(),
        language: Joi.string()
    })
});
