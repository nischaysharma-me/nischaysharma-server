import conversationService from '../services/conversationService.js';

class ConversationController {
    /**
     * Create a new conversation thread
     */
    async createThread(req, res) {
        try {
            const { title, initialMessage } = req.body;
            // Assuming auth middleware sets req.user.uid
            const userId = req.user?.uid || 'anonymous';
            
            const thread = await conversationService.createThread(userId, title, initialMessage);
            
            res.status(201).json({
                success: true,
                data: thread
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get user's conversation threads
     */
    async getUserThreads(req, res) {
        try {
            const userId = req.user?.uid || 'anonymous';
            const threads = await conversationService.getUserThreads(userId);
            
            res.status(200).json({
                success: true,
                data: threads
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get a specific thread
     */
    async getThread(req, res) {
        try {
            const { threadId } = req.params;
            const thread = await conversationService.getThread(threadId);
            
            res.status(200).json({
                success: true,
                data: thread
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Update thread metadata
     */
    async updateThread(req, res) {
        try {
            const { threadId } = req.params;
            const { title, isPinned } = req.body;
            
            const updatedThread = await conversationService.updateThread(threadId, { title, isPinned });
            
            res.status(200).json({
                success: true,
                data: updatedThread
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Stream reply from AI for a given thread
     * Endpoint: POST /api/v1/conversations/:threadId/stream
     */
    async streamReply(req, res) {
        try {
            const { threadId } = req.params;
            const { message } = req.body;

            if (!message) {
                return res.status(400).json({
                    success: false,
                    message: "Message is required to stream reply"
                });
            }

            // Set up Server-Sent Events (SSE) headers
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            const userId = req.user?.uid || 'anonymous';
            const stream = conversationService.streamReply(userId, threadId, message);

            for await (const chunk of stream) {
                console.log(chunk)
                // Send data chunk to the client
                res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
                
            }

            // Signal end of stream
            res.write('data: [DONE]\n\n');
            res.end();

        } catch (error) {
            console.error('Streaming error:', error);
            // If headers have not been sent yet, we can send a 500
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: error.message
                });
            } else {
                // Otherwise write an error event and end
                res.write(`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`);
                res.end();
            }
        }
    }

    /**
     * Delete a thread
     */
    async deleteThread(req, res) {
        try {
            const { threadId } = req.params;
            await conversationService.deleteThread(threadId);
            
            res.status(200).json({
                success: true,
                message: 'Thread deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

export default new ConversationController();
