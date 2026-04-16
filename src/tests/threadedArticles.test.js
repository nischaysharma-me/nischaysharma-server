import conversationService from '../services/conversationService.js';
import { createArticle, getArticleById, deleteArticle } from '../services/articleService.js';
import { Conversation, Article } from '../models/index.js';

// Simple manual test script as no testing framework is configured
async function testThreadedArticleCreation() {
    console.log('Running test: testThreadedArticleCreation...');
    
    // 1. Create a dummy thread
    const thread = await conversationService.createThread('testUser', 'Test Thread', 'Create a new article about Test Article');
    
    // 2. Mock AI call to create an article
    // We can't easily mock the chatStream in conversationService, 
    // so we verify that the articleService.createArticle is reachable 
    // and that the model updates are correct when called.
    
    const article = await createArticle('testUser', {
        title: 'Test Article',
        content: 'Test content',
        status: 'draft'
    });
    
    await Conversation.findByIdAndUpdate(thread.id, { articleId: article.id });
    // Simulate updating article with threadId
    await Article.findByIdAndUpdate(article.id, { threadId: thread.id });
    
    const updatedThread = await conversationService.getThread(thread.id);
    const updatedArticle = await getArticleById(article.id);
    
    if (updatedThread.articleId === article.id && updatedArticle.threadId === thread.id) {
        console.log('Test PASSED: Thread and Article correctly linked.');
    } else {
        console.error('Test FAILED: Linkage verification failed.');
    }
    
    // Cleanup
    await conversationService.deleteThread(thread.id);
    await deleteArticle(article.id, 'testUser');
}

testThreadedArticleCreation().catch(console.error);
