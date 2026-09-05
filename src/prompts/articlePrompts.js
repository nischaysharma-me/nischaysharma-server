import { renderPrompt } from '../services/promptLibraryService.js';

export function generateStructurePrompt(topic, depth = 'standard', instructions = '') {
    const key = depth === 'deep-dive'
        ? 'article.structure.deep-dive'
        : 'article.structure.standard';

    return renderPrompt(key, {
        topic,
        userInstructions: instructions || 'No additional instructions.'
    });
}

export function generateContentPrompt(structure, imageUrls, depth = 'standard', templateInstructions = '') {
    const key = depth === 'deep-dive'
        ? 'article.content.deep-dive'
        : 'article.content.standard';

    return renderPrompt(key, {
        title: structure.title,
        description: structure.description || '',
        templateInstructions: templateInstructions || 'No additional instructions.',
        sectionsJson: structure.sections || [],
        imageUrlsJson: imageUrls || {}
    });
}

export function generateTemplatePrompt(description) {
    return renderPrompt('article.template', { description });
}
