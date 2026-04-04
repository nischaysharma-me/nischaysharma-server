import GoogleSearchTool from "./googleSearch.js";
import JobSearchTool from "./jobSearch.js";
import logger from '../utils/logger.js';

/**
 * Available Tools Registry
 * Manages all available tools that AI providers can use
 */
class ToolRegistry {
    constructor() {
        this.tools = new Map();
        this.registerDefaultTools();
    }

    /**
     * Register default tools
     * @private
     */
    registerDefaultTools() {
        // Register Google Search
        const googleSearch = new GoogleSearchTool();
        if (googleSearch.isAvailable()) {
            this.register(googleSearch);
        }

        // Register Job Search
        const jobSearch = new JobSearchTool();
        this.register(jobSearch);

        // Add more default tools here as they're created
    }

    /**
     * Register a tool
     * @param {BaseTool} tool - Tool instance to register
     */
    register(tool) {
        if (!tool.name) {
            throw new Error("Tool must have a name");
        }

        this.tools.set(tool.name, tool);
        logger.log(`✅ Registered tool: ${tool.name}`);
    }

    /**
     * Unregister a tool
     * @param {string} toolName - Name of tool to unregister
     */
    unregister(toolName) {
        this.tools.delete(toolName);
    }

    /**
     * Get a specific tool by name
     * @param {string} toolName - Name of the tool
     * @returns {BaseTool|undefined}
     */
    getTool(toolName) {
        return this.tools.get(toolName);
    }

    /**
     * Get all registered tools
     * @returns {BaseTool[]}
     */
    getAllTools() {
        return Array.from(this.tools.values());
    }

    /**
     * Get tool definitions for AI provider
     * Returns array of tool schemas that AI can understand
     * @returns {object[]}
     */
    getToolDefinitions() {
        return this.getAllTools().map((tool) => tool.getDefinition());
    }

    /**
     * Execute a tool by name
     * @param {string} toolName - Name of tool to execute
     * @param {object} params - Tool parameters
     * @returns {Promise<any>}
     */
    async executeTool(toolName, params) {
        const tool = this.getTool(toolName);

        if (!tool) {
            throw new Error(`Tool not found: ${toolName}`);
        }

        if (!tool.validateParams(params)) {
            throw new Error(`Invalid parameters for tool: ${toolName}`);
        }

        return await tool.execute(params);
    }

    /**
     * Check if any tools are available
     * @returns {boolean}
     */
    hasTools() {
        return this.tools.size > 0;
    }

    /**
     * Get list of available tool names
     * @returns {string[]}
     */
    getToolNames() {
        return Array.from(this.tools.keys());
    }
}

// Singleton instance
const toolRegistry = new ToolRegistry();

export default toolRegistry;
export { ToolRegistry };