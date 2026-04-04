import { Conversation } from '../models/index.js';
import * as aiService from './aiService.js';
import { uploadUserAsset } from './storageService.js';
import { addJob } from './jobService.js';
import bookService from './bookService.js';
import { imageGeneratorToolSchema } from '../tools/imageGenerator.js';
import { 
    draftChapterPageToolSchema, 
    createChapterToolSchema,
    updateBookPageToolSchema, 
    deleteBookPageToolSchema 
} from '../tools/bookTools.js';

/**
 * Service for handling AI conversation threads
 */
class ConversationService {
    /**
     * Create a new conversation thread
     * @param {string} userId 
     * @param {string} title 
     * @param {string} initialMessage 
     * @returns {Promise<object>} The created thread document
     */
    async createThread(userId, title, initialMessage) {
        const threadData = {
            userId,
            title: title || 'New Conversation',
            messages: []
        };

        if (initialMessage) {
            threadData.messages.push({
                role: 'user',
                content: initialMessage,
                timestamp: new Date().toISOString()
            });
        }

        // FirebaseModel.create returns { id, ...data }
        return await Conversation.create(threadData);
    }

    /**
     * Get a conversation thread by ID
     * @param {string} threadId 
     * @returns {Promise<object>}
     */
    async getThread(threadId) {
        const thread = await Conversation.findById(threadId);
        if (!thread) {
            throw new Error('Conversation not found');
        }
        return thread;
    }

    /**
     * Update thread metadata (title, pinned status)
     * @param {string} threadId 
     * @param {object} updates 
     * @returns {Promise<object>}
     */
    async updateThread(threadId, updates) {
        const allowedUpdates = ['title', 'isPinned'];
        const filteredUpdates = {};
        
        allowedUpdates.forEach(key => {
            if (updates[key] !== undefined) {
                filteredUpdates[key] = updates[key];
            }
        });

        if (Object.keys(filteredUpdates).length === 0) {
            throw new Error('No valid update fields provided');
        }

        return await Conversation.findByIdAndUpdate(threadId, filteredUpdates, { new: true });
    }

    /**
     * Get all conversations for a user
     * @param {string} userId 
     * @returns {Promise<Array>}
     */
    async getUserThreads(userId) {
        return await Conversation.getByUserId(userId);
    }

    /**
     * Add a message to an existing thread
     * @param {string} threadId 
     * @param {string} role 'user' | 'assistant'
     * @param {string} content 
     * @returns {Promise<object>}
     */
    async addMessageToThread(threadId, role, content) {
        const newMessage = {
            role,
            content,
            timestamp: new Date().toISOString()
        };

        await Conversation.addMessage(threadId, newMessage);
        return newMessage;
    }

    /**
     * Get the stream for a new message, saving the history
     * @param {string} userId
     * @param {string} threadId 
     * @param {string} userMessage 
     * @returns {AsyncGenerator}
     */
    async *streamReply(userId, threadId, userMessage) {
        // 1. Add user message to the thread
        await this.addMessageToThread(threadId, 'user', userMessage);

        // 2. Prepare the context for the AI (all previous messages + the one just added)
        const updatedThread = await this.getThread(threadId);
        const messagesForAI = updatedThread.messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        // 3. Request the stream from AI Service
        const stream = aiService.chatStream(messagesForAI, {
            tools: [{ 
                functionDeclarations: [
                    imageGeneratorToolSchema,
                    draftChapterPageToolSchema,
                    createChapterToolSchema,
                    updateBookPageToolSchema,
                    deleteBookPageToolSchema
                ] 
            }]
        });

        // 4. Yield chunks and aggregate full response
        let fullResponse = '';
        for await (const chunk of stream) {
            if (chunk && chunk.text) {
                fullResponse += chunk.text;
                yield chunk.text;
            }

            // Handle function calls
            if (chunk && chunk.functionCalls && chunk.functionCalls.length > 0) {
                for (const call of chunk.functionCalls) {
                    // --- Handle Image Generation ---
                    if (call.name === 'generate_image') {
                        const args = call.args || {};
                        const prompt = args.prompt;
                        
                        yield '\n\n*Generating image...*\n\n';
                        
                        try {
                            const imageResult = await aiService.generateImage(prompt);
                            
                            if (imageResult && imageResult.images && imageResult.images.length > 0) {
                                // Assume first image
                                const inlineData = imageResult.images[0].inlineData;
                                const buffer = Buffer.from(inlineData.data, 'base64');
                                const mimeType = inlineData.mimeType;
                                
                                const filename = `${Date.now()}.png`;
                                const uploadResult = await uploadUserAsset(userId, buffer, mimeType, `threads/${threadId}/images`, filename);
                                
                                const markdownImage = `\n\n![Generated Image](${uploadResult.url})\n\n`;
                                fullResponse += markdownImage;
                                yield markdownImage;
                            } else {
                                const errorMsg = '\n\n*Failed to generate image.*\n\n';
                                fullResponse += errorMsg;
                                yield errorMsg;
                            }
                        } catch (error) {
                            console.error('Image generation error:', error);
                            const errorMsg = `\n\n*Failed to generate image: ${error.message}*\n\n`;
                            fullResponse += errorMsg;
                            yield errorMsg;
                        }
                    }

                    // --- Handle Threaded Book Tools ---
                    if (['draft_chapter_page', 'create_chapter', 'update_book_page', 'delete_book_page'].includes(call.name)) {
                        if (!updatedThread.bookId) {
                            const errorMsg = '\n\n*Error: This conversation is not linked to a book. Please create a book first.*\n\n';
                            yield errorMsg;
                            fullResponse += errorMsg;
                            continue;
                        }

                        const args = call.args || {};

                        try {
                            if (call.name === 'create_chapter') {
                                yield `\n\n*Creating chapter: **${args.title}**...*\n\n`;
                                const book = await bookService.addChapter(updatedThread.bookId, args.title);
                                const newChapter = book.chapters[book.chapters.length - 1];
                                const successMsg = `\n\n*Successfully created chapter: **${args.title}** (ID: ${newChapter.id}).*\n\n`;
                                yield successMsg;
                                fullResponse += successMsg;
                            }

                            if (call.name === 'draft_chapter_page') {
                                const book = await bookService.getBook(updatedThread.bookId);
                                let targetChapterId = args.chapterId;

                                // Auto-select chapter if not provided
                                if (!targetChapterId) {
                                    if (book.type === 'paper' || book.chapters.length === 1) {
                                        targetChapterId = book.chapters[0].id;
                                    } else if (book.chapters.length > 0) {
                                        targetChapterId = book.chapters[book.chapters.length - 1].id;
                                    } else {
                                        throw new Error('No chapters found in book. Please create a chapter first.');
                                    }
                                }

                                yield `\n\n*Initiating background generation for a new page...*\n\n`;
                                
                                const jobData = {
                                    bookId: updatedThread.bookId,
                                    chapterId: targetChapterId,
                                    threadId: threadId,
                                    topic: args.brief
                                };

                                const job = await addJob('book-page-generation', jobData, userId);
                                
                                const successMsg = `\n\n*Background job started (ID: ${job.id}). The page will be added to the book once complete.*\n\n`;
                                yield successMsg;
                                fullResponse += successMsg;
                            }

                            if (call.name === 'update_book_page') {
                                yield `\n\n*Updating page ID: ${args.pageId}...*\n\n`;
                                await bookService.updatePage(args.pageId, { content: args.content });
                                const successMsg = `\n\n*Successfully updated page content.*\n\n`;
                                yield successMsg;
                                fullResponse += successMsg;
                            }

                            if (call.name === 'delete_book_page') {
                                yield `\n\n*Deleting page ID: ${args.pageId}...*\n\n`;
                                await bookService.deletePage(args.pageId);
                                const successMsg = `\n\n*Successfully removed page from the book.*\n\n`;
                                yield successMsg;
                                fullResponse += successMsg;
                            }
                        } catch (error) {
                            console.error(`Book tool error (${call.name}):`, error);
                            const errorMsg = `\n\n*Failed to execute ${call.name}: ${error.message}*\n\n`;
                            yield errorMsg;
                            fullResponse += errorMsg;
                        }
                    }
                }
            }
        }

        // 5. Save the complete AI response
        if (fullResponse) {
            await this.addMessageToThread(threadId, 'assistant', fullResponse);
        }
    }
    
    /**
     * Delete a conversation
     * @param {string} threadId 
     */
    async deleteThread(threadId) {
        return await Conversation.findByIdAndDelete(threadId);
    }
}

export default new ConversationService();
