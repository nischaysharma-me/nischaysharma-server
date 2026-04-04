/**
 * Tool Schema for drafting a new book page into a specific chapter.
 */
export const draftChapterPageToolSchema = {
    name: "draft_chapter_page",
    description: "Drafts a new page for the attached book. Use ONLY when the user explicitly requests to 'draft', 'write', or 'solidify' the brainstorming into the book.",
    parameters: {
        type: "OBJECT",
        properties: {
            chapterId: {
                type: "STRING",
                description: "The ID of the chapter to add this page to. If the book is a 'paper' or has only one chapter, this can be omitted."
            },
            brief: { 
                type: "STRING", 
                description: "A short brief or topic describing what this page should cover based on the brainstorming conversation." 
            }
        },
        required: ["brief"]
    }
};

/**
 * Tool Schema for creating a new named chapter in the book.
 */
export const createChapterToolSchema = {
    name: "create_chapter",
    description: "Creates a new named chapter in the book. Use this when the user wants to start a new section or chapter.",
    parameters: {
        type: "OBJECT",
        properties: {
            title: { 
                type: "STRING", 
                description: "The title of the new chapter." 
            }
        },
        required: ["title"]
    }
};

/**
 * Tool Schema for updating an existing book page
 */
export const updateBookPageToolSchema = {
    name: "update_book_page",
    description: "Updates the content of an existing page. Use this when the user asks to refine, expand, or correct a previously drafted page.",
    parameters: {
        type: "OBJECT",
        properties: {
            pageId: {
                type: "STRING",
                description: "The ID of the page to update."
            },
            content: { 
                type: "STRING", 
                description: "The updated markdown content for the page." 
            }
        },
        required: ["pageId", "content"]
    }
};

/**
 * Tool Schema for deleting a book page
 */
export const deleteBookPageToolSchema = {
    name: "delete_book_page",
    description: "Deletes a specific page from the book. Use this only when the user explicitly asks to remove a page.",
    parameters: {
        type: "OBJECT",
        properties: {
            pageId: {
                type: "STRING",
                description: "The ID of the page to delete."
            }
        },
        required: ["pageId"]
    }
};
