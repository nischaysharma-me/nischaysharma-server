import { GoogleGenAI } from "@google/genai";
import BaseAIProvider from "../base.js";
import { AI_CONFIG } from "../../../config/ai.js";

class GeminiAIProvider extends BaseAIProvider {
    constructor() {
        super();

        if (!AI_CONFIG.gemini.apiKey) {
            throw new Error("GEMINI_API_KEY is not configured in environment variables");
        }

        this.ai = new GoogleGenAI({
            apiKey: AI_CONFIG.gemini.apiKey,
        });

        this.config = AI_CONFIG.gemini;
        this.toolsEnabled = AI_CONFIG.common.enableTools;
    }

    /**
     * Helper to safely extract text from response
     * @private
     */
    _getText(response) {
        if (typeof response.text === 'function') {
            return response.text();
        }
        return response.text || "";
    }

    /**
     * Helper to safely extract function calls from response
     * @private
     */
    _getFunctionCalls(response) {
        if (typeof response.functionCalls === 'function') {
            return response.functionCalls();
        }
        return response.functionCalls || null;
    }

    /**
     * Generate text/multimodal content from a prompt
     * @param {string|object[]} prompt - The prompt (string or array of parts)
     * @param {object} options - Generation options
     * @param {string} options.model - Model to use
     * @param {number} options.temperature - Sampling temperature
     * @param {number} options.maxTokens - Maximum tokens to generate
     * @param {boolean} options.useTools - Enable Google Search grounding
     * @param {string[]} options.responseModalities - ['TEXT', 'IMAGE'] etc.
     * @param {string} options.aspectRatio - For image generation ('16:9', '1:1' etc.)
     * @param {string} options.imageSize - For image generation ('2K', '4K' etc.)
     * @param {string} options.responseMimeType - Response MIME type
     * @param {object} options.responseJsonSchema - JSON schema for structured output
     * @returns {Promise<object>} - Generated response
     */
    async generateText(prompt, options = {}) {
        try {
            const model = this._getModelName(options.model);
            const useTools = options.useTools && this.toolsEnabled;

            // Handle multimodal parts or simple string
            const contents = Array.isArray(prompt) ? prompt : [{ text: prompt }];

            const config = {
                model: model,
                contents: [{ role: 'user', parts: contents }],
                generationConfig: {
                    temperature: options.temperature || this.config.generationConfig.temperature,
                    maxOutputTokens: options.maxTokens || this.config.generationConfig.maxOutputTokens,
                    topP: options.topP || this.config.generationConfig.topP,
                    topK: options.topK || this.config.generationConfig.topK,
                },
            };

            // Add advanced configuration for multimodal outputs
            if (options.responseModalities || options.aspectRatio || options.imageSize) {
                config.config = config.config || {};
                
                if (options.responseModalities) {
                    config.config.responseModalities = options.responseModalities;
                }
                
                if (options.aspectRatio || options.imageSize) {
                    config.config.imageConfig = {};
                    if (options.aspectRatio) config.config.imageConfig.aspectRatio = options.aspectRatio;
                    if (options.imageSize) config.config.imageConfig.imageSize = options.imageSize;
                }
            }

            // Add structured output configuration
            if (options.responseMimeType) {
                config.config = config.config || {};
                config.config.responseMimeType = options.responseMimeType;
            }

            if (options.responseJsonSchema) {
                config.config = config.config || {};
                config.config.responseSchema = options.responseJsonSchema;
            }

            // Add tools if enabled
            if (useTools || options.tools) {
                config.config = config.config || {};
                config.config.tools = this._getToolsConfig(options.tools, useTools);
            }

            const response = await this.ai.models.generateContent(config);

            // Extract text and any generated images
            const text = this._getText(response);
            const images = this._extractImages(response);

            return {
                success: true,
                text: text,
                images: images,
                provider: "gemini",
                model: model,
                groundingMetadata: response.groundingMetadata || null,
                functionCalls: this._getFunctionCalls(response),
            };
        } catch (error) {
            throw new Error(`Gemini API Error: ${error.message}`);
        }
    }

    /**
     * Helper to extract images from response
     * @private
     */
    _extractImages(response) {
        const images = [];
        if (response.candidates && response.candidates[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    images.push({
                        inlineData: part.inlineData
                    });
                }
            }
        }
        return images;
    }

    /**
     * Chat with conversational context
     * @param {Array} messages - Array of message objects with role and content
     * @param {object} options - Generation options
     * @param {boolean} options.useTools - Enable Google Search grounding (default: false)
     * @param {string[]} options.responseModalities - ['TEXT', 'IMAGE']
     * @param {string} options.aspectRatio - Aspect ratio for generated images
     * @param {string} options.imageSize - Image size (e.g., '2K')
     * @param {string} options.responseMimeType - Response MIME type
     * @param {object} options.responseJsonSchema - JSON schema for structured output
     * @returns {Promise<object>} - Generated response message
     */
    async chat(messages, options = {}) {
        try {
            const model = this._getModelName(options.model);
            const useTools = options.useTools && this.toolsEnabled;

            // Convert messages to Gemini format, supporting both text and multimodal parts
            const contents = messages.map(msg => ({
                role: msg.role === "assistant" ? "model" : "user",
                parts: Array.isArray(msg.content) ? msg.content : [{ text: msg.content }],
            }));

            const config = {
                model: model,
                contents: contents,
                generationConfig: {
                    temperature: options.temperature || this.config.generationConfig.temperature,
                    maxOutputTokens: options.maxTokens || this.config.generationConfig.maxOutputTokens,
                    topP: options.topP || this.config.generationConfig.topP,
                    topK: options.topK || this.config.generationConfig.topK,
                },
            };

            // Add advanced configuration for multimodal outputs
            if (options.responseModalities || options.aspectRatio || options.imageSize) {
                config.config = config.config || {};
                
                if (options.responseModalities) {
                    config.config.responseModalities = options.responseModalities;
                }
                
                if (options.aspectRatio || options.imageSize) {
                    config.config.imageConfig = {};
                    if (options.aspectRatio) config.config.imageConfig.aspectRatio = options.aspectRatio;
                    if (options.imageSize) config.config.imageConfig.imageSize = options.imageSize;
                }
            }

            // Add structured output configuration
            if (options.responseMimeType) {
                config.config = config.config || {};
                config.config.responseMimeType = options.responseMimeType;
            }

            if (options.responseJsonSchema) {
                config.config = config.config || {};
                config.config.responseSchema = options.responseJsonSchema;
            }

            // Add tools if enabled
            if (useTools || options.tools) {
                config.config = config.config || {};
                config.config.tools = this._getToolsConfig(options.tools, useTools);
            }

            const response = await this.ai.models.generateContent(config);

            const text = this._getText(response);
            const images = this._extractImages(response);

            return {
                success: true,
                message: {
                    role: "assistant",
                    content: text,
                    images: images,
                },
                provider: "gemini",
                model: model,
                groundingMetadata: response.groundingMetadata || null,
                functionCalls: this._getFunctionCalls(response),
            };
        } catch (error) {
            throw new Error(`Gemini API Error: ${error.message}`);
        }
    }

    /**
     * Chat with conversational context (streaming)
     * @param {Array} messages - Array of message objects with role and content
     * @param {object} options - Generation options
     * @returns {AsyncGenerator} - Async generator yielding text chunks
     */
    async *chatStream(messages, options = {}) {
        try {
            const model = this._getModelName(options.model);
            const useTools = options.useTools && this.toolsEnabled;

            // Convert messages to Gemini format
            const contents = messages.map(msg => ({
                role: msg.role === "assistant" ? "model" : "user",
                parts: Array.isArray(msg.content) ? msg.content : [{ text: msg.content }],
            }));

            const config = {
                model: model,
                contents: contents,
                generationConfig: {
                    temperature: options.temperature || this.config.generationConfig.temperature,
                    maxOutputTokens: options.maxTokens || this.config.generationConfig.maxOutputTokens,
                    topP: options.topP || this.config.generationConfig.topP,
                    topK: options.topK || this.config.generationConfig.topK,
                },
            };

            // Add tools if enabled
            if (useTools || options.tools) {
                config.config = config.config || {};
                config.config.tools = this._getToolsConfig(options.tools, useTools);
            }

            const responseStream = await this.ai.models.generateContentStream(config);

            for await (const chunk of responseStream) {
                yield {
                    success: true,
                    text: this._getText(chunk),
                    functionCalls: this._getFunctionCalls(chunk),
                    chunk: chunk
                };
            }
        } catch (error) {
            throw new Error(`Gemini Streaming API Error: ${error.message}`);
        }
    }

    /**
     * Get tools configuration for Gemini
     * @private
     * @param {object[]} customTools - Custom function declarations
     * @param {boolean} useGoogleSearch - Whether to enable Google Search
     * @returns {object[]}
     */
    _getToolsConfig(customTools = [], useGoogleSearch = false) {
        const tools = [];

        // Use Gemini's native grounding tool (Google Search)
        if (useGoogleSearch) {
            tools.push({ googleSearch: {} });
        }

        // Add custom function declarations
        if (customTools && customTools.length > 0) {
            // If customTools is array of function declarations, wrap it
            // The structure expected by Gemini SDK is usually [{ functionDeclarations: [...] }]
            // but checking if the user passed pre-formatted tools or just declarations
            const hasDeclarations = customTools.some(t => t.functionDeclarations);

            if (hasDeclarations) {
                tools.push(...customTools);
            } else {
                // Assume these are raw function declarations
                tools.push({ functionDeclarations: customTools });
            }
        }

        return tools;
    }

    /**
     * Generate an image using configured image model
     * @param {string} prompt 
     * @param {object} options 
     */
    async generateImage(prompt, options = {}) {
        try {
            const model = this._getModelName(options.model || "image");
            
            // Set up config for image generation
            const config = {
                model: model,
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
            };
            
            // Add image specific configuration if provided
            if (options.aspectRatio || options.imageSize) {
                config.config = {
                    responseModalities: ['TEXT', 'IMAGE'],
                    imageConfig: {}
                };
                
                if (options.aspectRatio) {
                    config.config.imageConfig.aspectRatio = options.aspectRatio;
                }
                
                if (options.imageSize) {
                    config.config.imageConfig.imageSize = options.imageSize;
                }
            }
            
            const response = await this.ai.models.generateContent(config);

            const images = [];
            // Check if candidates and content exist
            if (response.candidates && response.candidates[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        images.push({
                            inlineData: part.inlineData
                        });
                    }
                }
            }

            return {
                success: true,
                images: images,
                provider: "gemini",
                model: model
            };
        } catch (error) {
            throw new Error(`Gemini Image Generation Error: ${error.message}`);
        }
    }

    /**
     * Helper method to resolve model name
     * Supports: 'flash', 'pro', 'image' or full model name
     * @private
     */
    _getModelName(modelOption) {
        if (!modelOption) {
            return this.config.defaultModel;
        }

        // Check if it's a shorthand (flash/pro/image)
        if (modelOption === "flash") {
            return this.config.models.flash;
        }

        if (modelOption === "pro") {
            return this.config.models.pro;
        }

        if (modelOption === "image") {
            return this.config.models.image;
        }

        // Otherwise, assume it's a full model name
        return modelOption;
    }
}

export default GeminiAIProvider;