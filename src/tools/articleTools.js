/**
 * Tool Schema for drafting a new article from the thread.
 */
export const createDraftArticleToolSchema = {
    name: "create_article",
    description: "Drafts a new article based on the brainstorming conversation. Use ONLY when the user explicitly requests to 'draft', 'write', or 'solidify' the brainstorming into an article.",
    parameters: {
        type: "OBJECT",
        properties: {
            title: { 
                type: "STRING", 
                description: "The title of the new article." 
            },
            brief: { 
                type: "STRING", 
                description: "A short brief or topic describing the article's core content." 
            }
        },
        required: ["title", "brief"]
    }
};

/**
 * Tool Schema for updating an existing article
 */
export const updateArticleToolSchema = {
    name: "update_article",
    description: "Updates the content or metadata of an existing article. Use this when the user asks to refine, expand, or correct the article.",
    parameters: {
        type: "OBJECT",
        properties: {
            articleId: {
                type: "STRING",
                description: "The ID of the article to update."
            },
            content: { 
                type: "STRING", 
                description: "The updated markdown content for the article." 
            }
        },
        required: ["articleId", "content"]
    }
};

/**
 * Tool Schema for deleting an article
 */
export const deleteArticleToolSchema = {
    name: "delete_article",
    description: "Deletes a specific article. Use this only when the user explicitly asks to remove an article.",
    parameters: {
        type: "OBJECT",
        properties: {
            articleId: {
                type: "STRING",
                description: "The ID of the article to delete."
            }
        },
        required: ["articleId"]
    }
};
