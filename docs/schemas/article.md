# Article Schema

Represents a long-form content piece, which can be free or monetized.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `title` | String | Yes | Title of the article (3-200 chars). |
| `slug` | String | Yes | URL-friendly unique identifier. |
| `description` | String | No | Short summary or subtitle (max 500 chars). |
| `content` | String | Yes | Full content in HTML or Markdown. |
| `preview` | String | No | Short excerpt shown for locked/paid content. |
| `backgroundImage` | String | No | URL to the main hero/cover image. |
| `imagesAttached` | Array | No | Array of URLs to images embedded in the content. |
| `authorId` | String | Yes | UID of the user who authored the article. |
| `templateId` | String | No | Reference to the `ArticleTemplate` used for generation. |
| `references` | Array | No | Sources or citations used in the article. |
| `relatedArticles` | Array | No | Array of Article IDs for "Read More" suggestions. |
| `tags` | Array | No | Array of tags (Strings). |
| `status` | String | Yes | Lifecycle state: `draft`, `published`, `archived`. |
| `access` | String | Yes | Control type: `free`, `paid_single`, `subscription_author`, `subscription_platform`. |
| `price` | Number | No | Cost if access is `paid_single`. |
| `currency` | String | No | Currency for the price (default: `USD`). |
| `subscriptionTier` | String | No | Required tier name (e.g., `premium`) if platform-wide subscription. |
| `views` | Number | No | Total view count (denormalized). |
| `likes` | Number | No | Total like count (denormalized). |
| `reviewCount` | Number | No | Total number of reviews. |
| `averageRating` | Number | No | Computed 1-5 average rating. |
| `createdAt` | Date | Yes | Timestamp of initial creation. |
| `updatedAt` | Date | Yes | Timestamp of last modification. |
| `publishedAt` | Date | No | Timestamp when the article was moved to `published` state. |
