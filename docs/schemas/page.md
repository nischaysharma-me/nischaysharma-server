# Page Schema

Individual content node within a `Book`. Represents a chapter or section.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `bookId` | String | Yes | ID of the parent book. |
| `chapterId` | String | Yes | Unique identifier for the chapter mapping. |
| `content` | String | Yes | Full Markdown/HTML body of the page. |
| `images` | Array | No | URLs to media embedded in this page. |
| `status` | String | Yes | Lifecycle: `draft`, `published`. |
| `lastDraftedFromMessageId` | String | No | ID of the AI message that generated this draft. |
| `createdAt` | Date | Yes | Timestamp of initial generation. |
| `updatedAt` | Date | Yes | Timestamp of last edit. |
