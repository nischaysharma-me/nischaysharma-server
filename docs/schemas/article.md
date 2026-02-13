# Article Schema

Represents a content piece (article, blog post, tutorial) in the system.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Yes | Unique identifier (Document ID). |
| `title` | String | Yes | Article title (3-200 chars). |
| `slug` | String | Yes | URL-friendly unique identifier (generated from title). |
| `description` | String | No | Short summary or meta description. |
| `content` | String | Yes | Main body content (HTML/Markdown). |
| `preview` | String | No | Snippet shown for locked content. |
| `authorId` | String | Yes | Reference to User UID. |
| `tags` | Array<String> | No | List of tag names. |
| `status` | String | Yes | `draft`, `published`, or `archived`. Default: `draft`. |
| `access` | String | Yes | Access model: `free`, `paid_single`, `subscription_author`, `subscription_platform`. |
| `price` | Number | No | Cost if access is `paid_single`. |
| `currency` | String | No | Currency code (default: USD). |
| `likes` | Number | No | Count of likes. |
| `reviewCount` | Number | No | Total number of reviews. |
| `averageRating` | Number | No | Average rating (0-5). |
| `publishedAt` | Date | No | Timestamp of publication. |
| `createdAt` | Date | Yes | Timestamp of creation. |
| `updatedAt` | Date | Yes | Timestamp of last update. |

## Sub-Schemas

### Review (Separate Collection)
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `articleId` | String | Yes | Reference to Article. |
| `userId` | String | Yes | Reference to User. |
| `rating` | Number | Yes | 1-5 stars. |
| `comment` | String | No | Text review. |

### Tag (Separate Collection)
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | Yes | Tag display name. |
| `slug` | String | Yes | Unique URL-friendly identifier. |
| `usageCount` | Number | No | Count of articles using this tag. |
