/**
 * Middleware factory to validate request body using Joi
 * @param {import('joi').ObjectSchema} schema 
 */
export const validateRequest = (schema) => {
    return (req, res, next) => {
        // If multipart/form-data, complex fields might need parsing if sent as JSON strings
        // This is a common pattern when mixing files + rich data
        if (req.headers['content-type']?.includes('multipart/form-data')) {
            ['hobbies', 'interests', 'expertise', 'socialLinks', 'preferences'].forEach(field => {
                if (typeof req.body[field] === 'string') {
                    try {
                        req.body[field] = JSON.parse(req.body[field]);
                    } catch (e) {
                        // ignore, maybe it's just a simple string or failed parse
                    }
                }
            });
        }

        const { error, value } = schema.validate(req.body, { 
            abortEarly: false, 
            stripUnknown: true 
        });

        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({
                success: false,
                error: errorMessage
            });
        }

        // Replace body with validated/sanitized value
        req.body = value;
        next();
    };
};
