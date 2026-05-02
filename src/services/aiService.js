import { AIProvider } from "../providers/ai/registry.js";
import logger from "../utils/logger.js";

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
    const { title, description, type = 'article' } = content;
    
    const prompt = `Write a professional, engaging LinkedIn post for a new ${type} I just published.
    
    Title: ${title}
    Description: ${description}
    
    Requirements:
    1. Start with an attention-grabbing hook.
    2. Summarize the key value proposition.
    3. Use a professional yet conversational tone.
    4. Include 2-3 relevant hashtags.
    5. Keep it under 1000 characters.
    6. DO NOT include links (I will add the link manually).
    
    Output only the post text.`;

    return await generateText(prompt, { temperature: 0.7 });
}

export { generateText, chat, chatStream, generateImage, generateSocialPost };
