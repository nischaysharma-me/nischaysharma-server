import { AIProvider } from "../providers/ai/registry.js";
import logger from "../utils/logger.js";
import { renderPrompt } from './promptLibraryService.js';
import { normalizeSocialPostPlan } from './socialPostService.js';

const ai = AIProvider(process.env.AI_PROVIDER || "gemini");

async function generateText(prompt, options = {}) {
    try {
        const result = await ai.generateText(prompt, options);
        return result;
    } catch (error) {
        throw new Error(`AI Service Error: ${error.message}`);
    }
}

async function chat(messages, options = {}) {
    try {
        const result = await ai.chat(messages, options);
        return result;
    } catch (error) {
        throw new Error(`AI Service Error: ${error.message}`);
    }
}

async function* chatStream(messages, options = {}) {
    try {
        const stream = await ai.chatStream(messages, options);
        for await (const chunk of stream) {
            yield chunk;
        }
    } catch (error) {
        throw new Error(`AI Service Error: ${error.message}`);
    }
}

async function generateImage(prompt, options = {}) {
    try {
        logger.log('xvf', prompt);
        return await ai.generateImage(prompt, options);
    } catch (error) {
        throw new Error(`AI Service Error: ${error.message}`);
    }
}

/**
 * Generate a professional LinkedIn post for an article or book
 * @param {Object} content - { title, description, type }
 */
async function generateSocialPost(content) {
    const { title, description, type = 'article', format = 'text' } = content;
    
    const prompt = await renderPrompt('social.linkedin.rich', {
        title,
        description: description || '',
        type,
        format
    });

    const result = await generateText(prompt, { temperature: 0.7 });
    return normalizeSocialPostPlan(result, { title, description, type, format });
}

/**
 * Generate a portrait visual for a LinkedIn image post.
 * The prompt is deliberately separate from the caption/deck prompt so it can
 * be tuned from the admin prompt library without changing application code.
 */
async function generateSocialPostImage(content) {
    const {
        title,
        description,
        type = 'article',
        purpose = 'post',
        slideHeadline = '',
        slideBody = '',
        imagePrompt = ''
    } = content;
    const promptKey = purpose === 'slide' ? 'social.linkedin.slide-image' : 'social.linkedin.image';
    const prompt = await renderPrompt(promptKey, {
        title,
        description: description || '',
        type,
        slideHeadline,
        slideBody,
        imagePrompt
    });

    return generateImage(prompt, {
        aspectRatio: purpose === 'slide' ? '16:9' : '4:5',
        imageSize: '2K'
    });
}

export { generateText, chat, chatStream, generateImage, generateSocialPost, generateSocialPostImage };
