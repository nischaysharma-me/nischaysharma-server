# Article Template Schema

Defines reusable structures and AI instructions for generating articles.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | Yes | Name of the template (e.g., 'Deep Dive Technical Guide'). |
| `slug` | String | Yes | URL-friendly unique identifier. |
| `description` | String | No | Summary of what this template is optimized for. |
| `category` | String | Yes | Category (e.g., `blog-post`, `technical-doc`, `tutorial`). |
| `structure` | Array | Yes | Skeleton of the article: `[{ heading, contentBrief, imagePrompt }]`. |
| `aiInstructions` | String | No | Specialized prompts for the AI writing engine. |
| `authorId` | String | Yes | UID of the user who created the template. |
| `isPublic` | Boolean | No | Whether the template is visible to all users (default: `false`). |
| `usageCount` | Number | No | Total number of articles generated using this template. |
| `createdAt` | Date | Yes | Timestamp of creation. |
| `updatedAt` | Date | Yes | Timestamp of last update. |
