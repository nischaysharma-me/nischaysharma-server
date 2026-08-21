import * as articleService from '../services/articleService.js';
import * as templateService from '../services/articleTemplateService.js';
import * as bookPageGenerationService from '../services/bookPageGenerationService.js';
import * as backgroundImageService from '../services/backgroundImageService.js';
import billboardService from '../services/billboardService.js';
import stackItemService from '../services/stackItemService.js';

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
    },
    'regenerate-background-image': async (userId, data) => {
        return backgroundImageService.regenerateBackgroundImage(userId, data);
    },
    'billboard-image-generation': async (userId, data) => {
        return billboardService.generateImageForBillboard(data.billboardId, data.prompt);
    },
    'stack-image-generation': async (userId, data) => {
        return stackItemService.generateImageForStackItem(data.stackItemId, data.prompt);
    }
};

export function getWorkerFunction(type) {
    return JOB_REGISTRY[type];
}
