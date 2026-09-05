import { renderPrompt } from '../services/promptLibraryService.js';

/**
 * Build conversation tool schemas from the editable prompt catalog.
 * Keeping this asynchronous ensures admin changes are reflected without a restart.
 */
export async function buildConversationToolSchemas() {
    const [
        imageDescription,
        imagePromptDescription,
        draftDescription,
        draftChapterDescription,
        draftBriefDescription,
        chapterDescription,
        chapterTitleDescription,
        updateDescription,
        updatePageIdDescription,
        updateContentDescription,
        deleteDescription,
        deletePageIdDescription
    ] = await Promise.all([
        renderPrompt('tool.generate-image.description'),
        renderPrompt('tool.generate-image.prompt'),
        renderPrompt('tool.draft-page.description'),
        renderPrompt('tool.draft-page.chapter-id'),
        renderPrompt('tool.draft-page.brief'),
        renderPrompt('tool.create-chapter.description'),
        renderPrompt('tool.create-chapter.title'),
        renderPrompt('tool.update-page.description'),
        renderPrompt('tool.update-page.page-id'),
        renderPrompt('tool.update-page.content'),
        renderPrompt('tool.delete-page.description'),
        renderPrompt('tool.delete-page.page-id')
    ]);

    return [
        {
            name: 'generate_image',
            description: imageDescription,
            parameters: {
                type: 'OBJECT',
                properties: {
                    prompt: { type: 'STRING', description: imagePromptDescription }
                },
                required: ['prompt']
            }
        },
        {
            name: 'draft_chapter_page',
            description: draftDescription,
            parameters: {
                type: 'OBJECT',
                properties: {
                    chapterId: { type: 'STRING', description: draftChapterDescription },
                    brief: { type: 'STRING', description: draftBriefDescription }
                },
                required: ['brief']
            }
        },
        {
            name: 'create_chapter',
            description: chapterDescription,
            parameters: {
                type: 'OBJECT',
                properties: {
                    title: { type: 'STRING', description: chapterTitleDescription }
                },
                required: ['title']
            }
        },
        {
            name: 'update_book_page',
            description: updateDescription,
            parameters: {
                type: 'OBJECT',
                properties: {
                    pageId: { type: 'STRING', description: updatePageIdDescription },
                    content: { type: 'STRING', description: updateContentDescription }
                },
                required: ['pageId', 'content']
            }
        },
        {
            name: 'delete_book_page',
            description: deleteDescription,
            parameters: {
                type: 'OBJECT',
                properties: {
                    pageId: { type: 'STRING', description: deletePageIdDescription }
                },
                required: ['pageId']
            }
        }
    ];
}
