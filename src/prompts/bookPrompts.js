import { renderPrompt } from '../services/promptLibraryService.js';

export function generatePageStructurePrompt(topic, history) {
    return renderPrompt('book.page.structure', { topic, history });
}

export function generatePageContentPrompt(structure, imageUrls, history) {
    return renderPrompt('book.page.content', {
        title: structure.title,
        history,
        sectionsJson: structure.sections || [],
        imageUrlsJson: imageUrls || {}
    });
}
