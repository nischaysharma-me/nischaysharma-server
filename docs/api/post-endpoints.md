# Post API Endpoints

Base URL: `/api/v1/posts`

Posts are short-form entries for the public social feed. Owners can keep drafts, generate content and images with AI, publish, archive, edit, and delete them. Unless noted otherwise, authenticated endpoints require a Firebase ID token in the `Authorization: Bearer <token>` header.

## Create a Post

- **URL**: `/`
- **Method**: `POST`
- **Auth**: Required

```json
{
  "title": "What I learned shipping a small product",
  "content": "The smallest feedback loops produced the clearest decisions...",
  "imageUrl": "https://example.com/image.jpg",
  "imageAltText": "A product feedback loop diagram",
  "tags": ["product", "learning"],
  "status": "draft"
}
```

`title` and `content` are required. `status` can be `draft` or `published` when creating a post.

## Generate an AI Draft

- **URL**: `/generate`
- **Method**: `POST`
- **Auth**: Required

```json
{
  "topic": "Why small feedback loops improve product decisions",
  "tone": "conversational",
  "instructions": "Use a practical example and end with a question."
}
```

Supported tones are `professional`, `conversational`, `bold`, `reflective`, and `educational`. The response is saved as an editable draft instead of being published automatically.

## List Posts

- **URL**: `/`
- **Method**: `GET`
- **Auth**: Optional
- **Query Parameters**:
  - `limit`: 1-100, default 20.
  - `skip`: Number of records to skip, default 0.
  - `scope=mine`: Return the authenticated user's posts.
  - `status`: Filter owned posts by `draft`, `published`, or `archived`.

Public and unauthenticated requests always return published posts ordered by publication date. `scope=mine` requires authentication and returns owned posts ordered by creation date.

## Get a Post

- **URL**: `/:id`
- **Method**: `GET`
- **Auth**: Optional

Published posts are public. Draft and archived posts are visible only to their owner.

## Update a Post

- **URL**: `/:id`
- **Method**: `PATCH`
- **Auth**: Required; owner only

The request may include any of `title`, `content`, `imageUrl`, `imageAltText`, `tags`, or `status`.

## Generate or Regenerate the Post Image

- **URL**: `/:id/generate-image`
- **Method**: `POST`
- **Auth**: Required; owner only

```json
{
  "visualDirection": "Minimal editorial illustration with warm colors"
}
```

The generated 4:5 image is grounded in the current post title, content, and tags, uploaded to Firebase Storage under `post_images`, and assigned to the post. When a generated image is replaced or its post is deleted, the service removes the previous owned asset where safe.

## Publish a Post

- **URL**: `/:id/publish`
- **Method**: `POST`
- **Auth**: Required; owner only

Marks the post as published and records its publication time.

## Delete a Post

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth**: Required; owner only

Deletes the post and any owned generated image associated with it.
