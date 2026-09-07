# Platform Integrations Architecture

This document outlines the architecture, data models, and API flows for integrating third-party platforms (specifically GitHub and LinkedIn) into the TaughtCode ecosystem.

## 1. Overview and Objectives

The goal is to allow users to connect external accounts to their TaughtCode profile to achieve the following:
- **GitHub**: Fetch public/private repositories to automatically populate the "Featured Projects" section and sync profile statistics (e.g., commit counts, top languages).
- **LinkedIn**: Enable reviewed, manual content distribution from an Article, Threaded Book, or short-form Post as text, an image post, or a document carousel.

## 2. Authentication Flow (OAuth 2.0)

Both integrations will utilize the standard OAuth 2.0 authorization code flow.

### Backend Routing (`/api/v1/integrations`)
- **Initiate Auth**: `GET /api/v1/integrations/:provider/auth`
  - Redirects the client to the provider's OAuth consent screen with appropriate scopes.
  - Generates a secure `state` parameter to prevent CSRF.
- **Handle Callback**: `GET /api/v1/integrations/:provider/callback`
  - Validates the `state`.
  - Exchanges the authorization code for an `access_token` (and `refresh_token` if applicable).
  - Encrypts and stores the tokens securely in the `User` document's `integrations` object.

## 3. Provider Specifics

### 3.1 GitHub Integration
- **OAuth Scopes**: `read:user`, `repo` (if fetching private projects is desired, otherwise public only).
- **Capabilities**:
  - `POST /api/v1/integrations/github/sync-projects`: Connects to GitHub's REST/GraphQL API to fetch pinned or top-starred repositories owned by the user. Maps the response to the TaughtCode `projects` schema (`{ title, description, link }`) and updates the profile.
  - `POST /api/v1/integrations/github/sync-profile`: Syncs bio, location, and avatar.

### 3.2 LinkedIn Integration
- **OAuth Scopes**: `openid`, `profile`, `email`, `w_member_social` (required for creating posts).
- **Capabilities**:
  - `POST /api/v1/integrations/linkedin/post`: Publishes text, a single image, or a generated PDF/document carousel.
  - Supports optional per-slide images and bulk generation for missing carousel visuals.
  - Fetches remote Firebase assets on the server before registering and uploading them to LinkedIn.
  - Uses dedicated article and post distribution pages so additional platforms can be introduced later.

### 3.3 AI Post and Media Generation
- **Goal**: Create editable short-form drafts and consistent social media assets from source content.
- **Implementation**: Uses Prompt Library templates for post drafts, captions, single images, and slide images. Article and post bodies are passed as grounding context.
- **Workflow**: Drafts and images are always reviewable before website or LinkedIn publication.
- **Prompt ownership**: Defaults are versioned in `prompts.example.json`; runtime overrides are stored in the ignored `prompts.json` file and managed from the admin Prompt Library.

## 4. Data Model and Configuration

TaughtCode supports a hybrid configuration model:
- **System Defaults**: Configured via environment variables (`GITHUB_CLIENT_ID`, etc.) for platform-wide apps.
- **User Overrides**: Users can provide their own Client ID and Client Secret directly in their profile (stored in the `integrations` object). This is ideal for developers who want to use their own personal OAuth apps.

### User Integration Schema
```javascript
integrations: {
    github: {
        clientId: String,     // User override
        clientSecret: String, // User override
        accessToken: String,  // OAuth result
        accountName: String,  // Normalized username
        connected: Boolean
    },
    linkedin: {
        clientId: String,
        clientSecret: String,
        accessToken: String,
        refreshToken: String,
        personUrn: String,    // Required for posting
        connected: Boolean
    }
}
```

## 5. Security Considerations
- **Token Storage**: OAuth access and refresh tokens are highly sensitive. They must be encrypted using a strong symmetric cipher (e.g., AES-256-GCM) before being saved to Firestore, and decrypted only when making API calls to the provider.
- **CSRF Protection**: The OAuth `state` parameter must be tied to the user's session or a secure cookie.

## 6. Frontend UI (`nischaysharma-client`)

The user interface is available in the Admin panel and dedicated distribution pages:
- **Connection Managers**: UI cards to connect/disconnect GitHub and LinkedIn.
- **Sync Actions**: A "Sync from GitHub" button next to the Featured Projects section.
- **Publishing Integration**: Dedicated `/admin/articles/:id/post/linkedin` and `/admin/posts/:id/post/linkedin` composers for caption, image, and carousel creation.
- **Posts Studio**: `/admin/posts` manages short-form drafts and publication, while `/posts` serves the public feed.
