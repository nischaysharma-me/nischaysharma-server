import * as articleService from '../services/articleService.js';
import * as templateService from '../services/articleTemplateService.js';
import * as bookPageGenerationService from '../services/bookPageGenerationService.js';

// Map Job Types to Service Functions
export const JOB_REGISTRY = {
    'article-generation': async (userId, data) => {
        return articleService.generateArticleContent(userId, data.topic, data.depth, data.instructions, data.templateId);
    },
    'template-generation': async (userId, data) => {
        return templateService.generateTemplate(userId, data.description, data.category);
    },
    'book-page-generation': async (userId, data) => {
        return bookPageGenerationService.generateBookPage(userId, data.bookId, data.chapterId, data.threadId, data.topic);
    }
};

export function getWorkerFunction(type) {
    return JOB_REGISTRY[type];
}
