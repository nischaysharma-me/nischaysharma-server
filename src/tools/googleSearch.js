import BaseTool from "./base.js";

/**
 * Google Search Tool
 * Performs web searches using Google Custom Search API
 */
class GoogleSearchTool extends BaseTool {
    constructor() {
        super();

        this.name = "google_search";
        this.description = "Search the web using Google to find current information, facts, news, and answers to questions. Use this when you need up-to-date information or facts that you don't have in your training data.";

        this.parameters = {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "The search query to execute",
                },
                numResults: {
                    type: "number",
                    description: "Number of results to return (1-10, default: 5)",
                    default: 5,
                },
            },
            required: ["query"],
        };

        this.apiKey = process.env.GOOGLE_SEARCH_API_KEY;
        this.searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

        if (!this.apiKey || !this.searchEngineId) {
            console.warn("Google Search API credentials not configured. Tool will not be available.");
        }
    }

    /**
     * Execute Google search
     * @param {object} params - Search parameters
     * @param {string} params.query - Search query
     * @param {number} params.numResults - Number of results (default: 5)
     * @returns {Promise<object>} - Search results
     */
    async execute(params) {
        if (!this.apiKey || !this.searchEngineId) {
            throw new Error("Google Search API not configured. Set GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID environment variables.");
        }

        const { query, numResults = 5 } = params;

        if (!query || typeof query !== "string") {
            throw new Error("Search query is required and must be a string");
        }

        const num = Math.min(Math.max(numResults, 1), 10);

        try {
            const url = new URL("https://www.googleapis.com/customsearch/v1");
            url.searchParams.append("key", this.apiKey);
            url.searchParams.append("cx", this.searchEngineId);
            url.searchParams.append("q", query);
            url.searchParams.append("num", num.toString());

            const response = await fetch(url.toString());

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Google Search API error: ${error.error?.message || response.statusText}`);
            }

            const data = await response.json();

            // Format results
            const results = (data.items || []).map((item, index) => ({
                position: index + 1,
                title: item.title,
                link: item.link,
                snippet: item.snippet,
                displayLink: item.displayLink,
            }));

            return {
                success: true,
                query: query,
                totalResults: data.searchInformation?.totalResults || 0,
                searchTime: data.searchInformation?.searchTime || 0,
                results: results,
            };
        } catch (error) {
            throw new Error(`Google Search failed: ${error.message}`);
        }
    }

    /**
     * Check if tool is available
     * @returns {boolean}
     */
    isAvailable() {
        return !!(this.apiKey && this.searchEngineId);
    }

    /**
     * Validate search parameters
     * @param {object} params
     * @returns {boolean}
     */
    validateParams(params) {
        if (!params.query || typeof params.query !== "string") {
            return false;
        }

        if (params.numResults !== undefined) {
            if (typeof params.numResults !== "number" || params.numResults < 1 || params.numResults > 10) {
                return false;
            }
        }

        return true;
    }
}

export default GoogleSearchTool;
