# Article API Endpoints

Base URL: `/api/v1/articles`

Authentication: Bearer Token (Firebase ID Token) for creation/updates/reviews. Optional for reading.

## Article Management

### Generate Article (AI)
Generate a full article with structure, content, and images using AI. **(Async Job)**

- **URL**: `/generate`
- **Method**: `POST`
- **Auth**: Required
- **Body Parameters**:
    - `topic` (String, Required): The topic to generate the article about.
    - `depth` (String, Optional): Level of detail. `standard` (default) or `deep-dive` (comprehensive).
    - `instructions` (String, Optional): Custom instructions.
- **Success Response**: `202 Accepted`
    ```json
    {
      "success": true,
      "data": {
        "jobId": "...",
        "status": "queued",
        "message": "Request accepted for background processing"
      }
    }
    ```
    *Poll `/api/v1/jobs/:id` for result.*

### Create Article
Create a new article draft.

- **URL**: `/`
- **Method**: `POST`
- **Auth**: Required
- **Body Parameters**:
    - `title` (String, Required)
    - `content` (String, Required)
    - `description` (String)
    - `tags` (Array<String>)
    - `access` (String): `free`, `paid_single`, etc.
    - `price` (Number)
- **Success Response**: `201 Created` with Article object.

### List Articles
Get a list of articles with optional filtering.

- **URL**: `/`
- **Method**: `GET`
- **Auth**: Optional
- **Query Params**:
    - `status` (default: `published` for public)
    - `authorId`
    - `tags`
- **Success Response**: `200 OK` with Array of Articles.

### Get Article by Slug
Retrieve a single article. If the article is paid/locked and the user doesn't have access, a preview is returned with `isLocked: true`.

- **URL**: `/:slug`
- **Method**: `GET`
- **Auth**: Optional (Required for full access to paid content)
- **Success Response**: 
    - `200 OK` with full Article object.
    - OR `200 OK` with Preview object (`content` omitted, `isLocked: true`).

### Update Article
Update an existing article. Only the author can update.

- **URL**: `/:id`
- **Method**: `PATCH`
- **Auth**: Required
- **Body Parameters**: Any writable Article field.
- **Success Response**: `200 OK` with updated Article.

### Publish Article
Publish a draft article to the public documentation system.

- **URL**: `/:id/publish`
- **Method**: `POST`
- **Auth**: Required (Author only)
- **Success Response**: `200 OK` with published Article.

## Engagement

### Add Review
Add a rating and comment to an article.

- **URL**: `/:id/reviews`
- **Method**: `POST`
- **Auth**: Required
- **Body Parameters**:
    - `rating` (Number, 1-5, Required)
    - `comment` (String, Optional)
- **Success Response**: `201 Created` with Review object.
