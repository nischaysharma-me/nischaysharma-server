import Joi from 'joi';

export const updateUserSchema = Joi.object({
    email: Joi.string().email().optional(),
    displayName: Joi.string().min(2).max(50),
    occupation: Joi.string().allow(''),
    bio: Joi.string().max(10000).allow(''),
    vision: Joi.string().max(10000).allow(''),
    skills: Joi.array().items(Joi.string()).optional(),
    projects: Joi.array().items(
        Joi.object({
            title: Joi.string().required(),
            description: Joi.string().allow(''),
            link: Joi.string().allow('').optional(),
            image: Joi.string().allow('').optional()
        })
    ).optional(),
    experience: Joi.array().items(
        Joi.object({
            company: Joi.string().required(),
            logo: Joi.string().allow('').optional(),
            location: Joi.string().allow('').optional(),
            roles: Joi.array().items(
                Joi.object({
                    title: Joi.string().required(),
                    startDate: Joi.string().allow(''),
                    endDate: Joi.string().allow(''),
                    description: Joi.string().allow(''),
                    employmentType: Joi.string().allow('').optional()
                })
            ).min(1).required()
        })
    ).optional(),
    education: Joi.array().items(
        Joi.object({
            school: Joi.string().required(),
            degree: Joi.string().allow(''),
            fieldOfStudy: Joi.string().allow(''),
            startDate: Joi.string().allow(''),
            endDate: Joi.string().allow(''),
            logo: Joi.string().allow('').optional()
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
