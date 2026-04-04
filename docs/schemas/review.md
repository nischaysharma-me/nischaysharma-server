# Review Schema

User feedback and rating for a published article.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `articleId` | String | Yes | ID of the article being reviewed. |
| `userId` | String | Yes | UID of the reviewer. |
| `rating` | Number | Yes | Numeric score (1-5). |
| `comment` | String | No | Optional text feedback (max 1000 chars). |
| `createdAt` | Date | Yes | Timestamp of submission. |
| `updatedAt` | Date | Yes | Timestamp of last modification. |
