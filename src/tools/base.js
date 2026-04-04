/**
 * Base Tool Class
 * All tools must extend this class and implement the execute method
 */
class BaseTool {
    constructor() {
        this.name = "";
        this.description = "";
        this.parameters = {};
    }

    /**
     * Execute the tool with given parameters
     * @param {object} params - Tool parameters
     * @returns {Promise<any>} - Tool result
     */
    async execute(params) {
        throw new Error("execute method must be implemented");
    }

    /**
     * Get tool definition for AI provider
     * Returns the schema that AI providers use to understand the tool
     * @returns {object} - Tool definition
     */
    getDefinition() {
        return {
            name: this.name,
            description: this.description,
            parameters: this.parameters,
        };
    }

    /**
     * Validate parameters before execution
     * @param {object} params - Parameters to validate
     * @returns {boolean} - Whether parameters are valid
     */
    validateParams(params) {
        return true;
    }
}

export default BaseTool;
