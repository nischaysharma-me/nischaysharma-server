import logger from '../utils/logger.js';
import * as aiService from './aiService.js';
import * as storageService from './storageService.js';
import { Conversation } from '../models/index.js';
import bookService from './bookService.js';
import { generatePageStructurePrompt, generatePageContentPrompt } from '../prompts/bookPrompts.js';

/**
 * Generate a book page in the background
 * @param {string} userId
 * @param {string} bookId
 * @param {string} chapterId
 * @param {string} threadId
 * @param {string} topic
 */
async function generateBookPage(userId, bookId, chapterId, threadId, topic) {
    logger.info(`BookPageGenerationService: Generating page for book ${bookId}, chapter ${chapterId} on topic "${topic}"`);

    // 1. Fetch Conversation History
    const thread = await Conversation.findById(threadId);
    if (!thread) throw new Error('Conversation thread not found');

    const historyText = thread.messages
        .map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`)
        .join('\n\n');

    // 2. Generate Structure
    const structureResult = await aiService.generateText(generatePageStructurePrompt(topic, historyText), {
        responseMimeType: 'application/json'
    });
    
    let structure;
    try {
        structure = JSON.parse(structureResult.text);
    } catch (e) {
        const match = structureResult.text.match(/\{[\s\S]*\}/);
        if (match) {
            structure = JSON.parse(match[0]);
        } else {
            throw new Error("Failed to generate valid page structure");
        }
    }

    // 3. Generate and Upload Images
    const imageUrls = {};
    const imagesAttached = [];
    for (const section of structure.sections) {
        if (section.imagePrompt) {
            try {
                const enhancedPrompt = `${section.imagePrompt}. NO TEXT. Related to ${topic}.`;
                const imageResult = await aiService.generateImage(enhancedPrompt, {
                    aspectRatio: section.imageAspectRatio || '16:9'
                });
                
                if (imageResult.success && imageResult.images.length > 0) {
                    const imgPart = imageResult.images[0];
                    let buffer, mimeType;

                    if (imgPart.inlineData) {
                        buffer = Buffer.from(imgPart.inlineData.data, 'base64');
                        mimeType = imgPart.inlineData.mimeType;
                    }

                    if (buffer) {
                        const filename = `page_${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
                        const uploadResult = await storageService.uploadUserAsset(
                            userId,
                            buffer,
                            mimeType,
                            `books/${bookId}/pages`,
                            filename
                        );
                        
                        imageUrls[section.heading] = uploadResult.url;
                        imagesAttached.push(uploadResult.url);
                    }
                }
            } catch (err) {
                logger.warn(`Failed to generate/upload image for page section "${section.heading}":`, err);
            }
        }
    }

    // 4. Generate Full Content
    const contentResult = await aiService.generateText(
        generatePageContentPrompt(structure, imageUrls, historyText),
        { model: 'pro' }
    );
    const content = contentResult.text;

    // 5. Save Page to Chapter
    const page = await bookService.createPage(bookId, chapterId, content, null, imagesAttached);
    
    logger.info(`BookPageGenerationService: Page generated successfully (ID: ${page.id})`);
    return page;
}

export {
    generateBookPage
};
