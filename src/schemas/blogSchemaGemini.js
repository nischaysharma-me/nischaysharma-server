// Define the root response schema for career insights
export const blogSchemaGemini = {
    type: "array",
    items: {
        type: "object",
        properties: {
            title: { type: "string" },
            content: { type: "string" },
            related_topics: {
                type: "array", items: {
                    type: "object",
                    properties: {
                        topic: { type: "string" },
                        description: { type: "string" },
                    },
                    required: ["topic", "description"],
                }
            },
        },
        required: ["title", "content", "related_topics"],
    },
}

