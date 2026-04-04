# Book Schema

Represents a hierarchical collection of pages, structured as a book or academic paper.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `userId` | String | Yes | UID of the owner/author. |
| `threadId` | String | No | ID of the conversation thread that spawned this book. |
| `title` | String | Yes | Title of the work (max 200 chars). |
| `description` | String | No | Summary or abstract (max 2000 chars). |
| `coverImage` | String | No | URL to the book's cover illustration. |
| `status` | String | Yes | Lifecycle: `draft`, `published`. |
| `type` | String | Yes | Structure type: `book` (multi-chapter) or `paper` (single-flow). |
| `chapters` | Array | No | Navigation tree: `[{ id, title, pageIds: [] }]`. |
| `metadata` | Object | No | Additional data: tags, genre, ISBN, etc. |
| `createdAt` | Date | Yes | Timestamp of creation. |
| `updatedAt` | Date | Yes | Timestamp of last update. |
