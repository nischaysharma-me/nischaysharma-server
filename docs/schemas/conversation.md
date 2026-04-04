# Conversation Schema

Stores threaded messages between a user and the AI engine.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `userId` | String | Yes | UID of the user participating in the conversation. |
| `bookId` | String | No | Optional reference to a book being authored in this thread. |
| `title` | String | No | Human-readable title for the thread (max 200 chars). |
| `isPinned` | Boolean | No | Whether the conversation is pinned to the top of the list. |
| `messages` | Array | No | The message history: `[{ role: 'user'|'assistant', content, timestamp }]`. |
| `createdAt` | Date | Yes | Timestamp of the first message. |
| `updatedAt` | Date | Yes | Timestamp of the most recent message. |
