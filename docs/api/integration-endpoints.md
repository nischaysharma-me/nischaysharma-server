# Integration API Endpoints

Base URL: `/api/v1/integrations`

Authentication: Bearer Token (Firebase ID Token) is required for most endpoints.

## OAuth Lifecycle

### Initiate OAuth
Redirects the user to the third-party provider for authorization.

- **URL**: `/:provider/auth`
- **Method**: `GET`
- **Auth**: Required
- **Path Params**:
    - `provider`: `github` or `linkedin`.
- **Success Response**: `200 OK`
    ```json
    {
      "success": true,
      "authUrl": "https://github.com/login/oauth/authorize?..."
    }
    ```

### OAuth Callback
Handle the redirect from the provider. This endpoint is public but verified via the `state` parameter (User Doc ID).

- **URL**: `/:provider/callback`
- **Method**: `GET`
- **Query Params**:
    - `code`: Authorization code.
    - `state`: Secure state string (user Doc ID).
- **Behavior**: Processes the token exchange and redirects back to the frontend with `integration_success` or `integration_error`.

## Content & Sync

### Sync GitHub Projects
Fetches top repositories from the connected GitHub account and prepares them for profile integration.

- **URL**: `/github/sync`
- **Method**: `POST`
- **Auth**: Required
- **Body Parameters**:
    - `action`: `get_repos`
- **Success Response**: `200 OK` with array of repository objects containing `title`, `description`, and `link`.

### Generate AI Post
Creates a social media summary for an article or book using Gemini AI.

- **URL**: `/ai-post`
- **Method**: `POST`
- **Auth**: Required
- **Body Parameters**:
    - `title`: The content title.
    - `description`: The content summary.
    - `type`: `article` or `book`.
- **Success Response**: `200 OK`
    ```json
    {
      "success": true,
      "data": "🚀 Just published... #Tech #AI"
    }
    ```

### Share to LinkedIn
Publishes a post directly to the user's LinkedIn feed.

- **URL**: `/linkedin/sync`
- **Method**: `POST`
- **Auth**: Required
- **Body Parameters**:
    - `text`: Post content.
    - `url`: (Optional) Link to the article/book.
    - `title`: (Optional) Link title.
- **Success Response**: `200 OK` with LinkedIn API response object.

## Management

### Remove Integration
Disconnects a provider and removes access tokens from the user profile.

- **URL**: `/:provider`
- **Method**: `DELETE`
- **Auth**: Required
- **Success Response**: `200 OK` with updated user profile.
