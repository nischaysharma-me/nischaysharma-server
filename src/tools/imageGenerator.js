export const imageGeneratorToolSchema = {
    name: "generate_image",
    description: "Generates an image based on a detailed prompt.",
    parameters: {
        type: "OBJECT",
        properties: {
            prompt: {
                type: "STRING",
                description: "The detailed image prompt"
            }
        },
        required: ["prompt"]
    }
};
