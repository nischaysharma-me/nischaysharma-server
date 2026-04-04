# AI Tool Calling & Streaming

## Overview
TaughtCode uses an advanced implementation of AI tool calling and real-time streaming to enable interactive, collaborative workflows. This document explains how these systems work and how to extend them.

## Real-time Streaming (SSE)
To provide a low-latency experience, the server uses **Server-Sent Events (SSE)** for AI responses.

### Implementation
- **Provider Layer**: The `BaseAIProvider` defines `chatStream`, and `GeminiAIProvider` implements it using `@google/genai`'s `generateContentStream`.
- **Controller Layer**: The `ConversationController` sets headers to `text/event-stream` and writes chunks to the response object as they arrive.
- **Protocol**: Chunks are sent in the format `data: {"text": "..."}`. The stream is closed with a final `data: [DONE]` message.

## Tool Calling Architecture
The system uses **Autonomous Tool Calling**, where the AI determines when it needs to call a specific function based on the user's prompt.

### 1. Defining a Tool
Tools are defined as JSON schemas following the Google Generative AI specification.
Example (`src/tools/bookTools.js`):
```javascript
export const draftBookPageToolSchema = {
    name: "draft_book_page",
    description: "...",
    parameters: {
        type: "OBJECT",
        properties: {
            title: { type: "STRING" },
            brief: { type: "STRING" }
        },
        required: ["title", "brief"]
    }
};
```

### 2. Registering Tools
Tools are passed to the AI during the `chatStream` call in `ConversationService.js`:
```javascript
const stream = aiService.chatStream(messages, {
    tools: [{ functionDeclarations: [draftBookPageToolSchema] }]
});
```

### 3. Handling Tool Execution
Inside the `streamReply` generator, we listen for `functionCalls` within the stream chunks:
1. **Detection**: Identify the tool name.
2. **Status Update**: Yield a message to the user (e.g., `*Drafting page...*`).
3. **Execution**: Call the relevant service (e.g., `bookService.createPage` or `jobService.addJob`).
4. **Persistence**: The results (like markdown links or status confirmations) are appended to the `fullResponse` and saved to the thread.

## Current AI Tools
- `generate_image`: Generates images and uploads them to Firebase Storage.
- `create_chapter`: Adds a new named container to a 'book' type publication.
- `draft_chapter_page`: Initiates a background job to synthesize the conversation into a Page within a specific chapter.
- `update_book_page`: Refines an existing page in a book.
- `delete_book_page`: Removes a page from a book.
