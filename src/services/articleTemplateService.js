import { ArticleTemplate } from '../models/index.js';
import * as aiService from './aiService.js';
import { generateTemplatePrompt } from '../prompts/articlePrompts.js';
import logger from '../utils/logger.js';

/**
 * Create a new template manually
 */
async function createTemplate(authorId, data) {
    // Generate slug
    const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const payload = {
        ...data,
        slug,
        authorId,
        usageCount: 0
    };

    const template = await ArticleTemplate.create(payload);
    logger.info(`ArticleTemplate created: ${template.id}`);
    return template;
}

/**
 * Generate a template using AI
 * @param {string} authorId 
 * @param {string} description 
 * @param {string} category 
 */
async function generateTemplate(authorId, description, category = 'blog-post') {
    logger.info(`Generating template from description: "${description}" (${category})`);

    const prompt = generateTemplatePrompt(description);
    const aiResult = await aiService.generateText(prompt, {
        responseMimeType: 'application/json'
    });

    let templateData;
    try {
        templateData = JSON.parse(aiResult.text);
    } catch (e) {
        const match = aiResult.text.match(/\{[\s\S]*\}/);
        if (match) {
            templateData = JSON.parse(match[0]);
        } else {
            throw new Error("Failed to generate valid template JSON");
        }
    }

    // Ensure category matches if AI hallucinated
    templateData.category = category;

    return await createTemplate(authorId, templateData);
}

/**
 * Get template by ID
 */
async function getTemplate(id) {
    const template = await ArticleTemplate.findById(id);
    if (!template) throw new Error('Template not found');
    return template;
}

/**
 * Get template by Slug
 */
async function getTemplateBySlug(slug) {
    const template = await ArticleTemplate.findOne({ slug });
    if (!template) throw new Error('Template not found');
    return template;
}

/**
 * List templates
 */
async function listTemplates(filters = {}) {
    return await ArticleTemplate.find(filters);
}

/**
 * Increment usage count
 */
async function incrementUsage(id) {
    const template = await ArticleTemplate.findById(id);
    if (template) {
        await ArticleTemplate.findByIdAndUpdate(id, {
            usageCount: (template.usageCount || 0) + 1
        });
    }
}

/**
 * Update a template
 */
async function updateTemplate(id, updates) {
    const template = await getTemplate(id);
    if (!template) throw new Error('Template not found');
    
    // Prevent updating sensitive fields
    delete updates.id;
    delete updates.authorId;
    delete updates.slug;

    return await ArticleTemplate.findByIdAndUpdate(id, updates, { new: true });
}

/**
 * Delete a template
 */
async function deleteTemplate(id) {
    const template = await getTemplate(id);
    if (!template) throw new Error('Template not found');
    
    await ArticleTemplate.findByIdAndDelete(id);
    return true;
}

export {
    createTemplate,
    generateTemplate,
    getTemplate,
    getTemplateBySlug,
    listTemplates,
    incrementUsage,
    updateTemplate,
    deleteTemplate
};
