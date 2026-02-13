# API Layer Documentation

The API follows RESTful principles and is built with Express.js.

## Base Configuration
*   **Prefix**: `/api/v1` (Configurable via env)
*   **Documentation**: `/api-docs` (Swagger UI)
*   **Internal Docs**: `/docs` (Markdown Portal)

## Middleware Chain
1.  **Global**: `cors`, `helmet`, `morgan`, `cookieParser`, `json`/`urlencoded` body parsers.
2.  **Authentication (`isAuthenticated`)**:
    *   Checks `x-api-key` header -> Validates via `apiKeyService`.
    *   Checks `Authorization: Bearer ...` header -> Validates via `authService` (Firebase Admin).
    *   Attaches `req.user` and `req.authType`.
3.  **Validation (`validateRequest`)**:
    *   Accepts a Joi schema.
    *   Validates `req.body`.
    *   Handles type conversion for `multipart/form-data` requests (JSON strings to objects).

## Controllers & Routes

### 1. User Profile (`/users`)
*   `POST /onboard`: Multipart request (Photo + JSON). Creates Profile + Organization.
*   `GET /me`: Returns current user's profile.
*   `PATCH /me`: Updates profile.
*   `GET /:id`: Admin/Public view of a user.
*   `PATCH /:id/deactivate`: Soft delete.

### 2. Articles (`/articles`)
*   `POST /generate`: **Async Job Trigger**. Enqueues an `article-generation` job. Returns `202 Accepted` with `jobId`.
*   `POST /templates/generate`: **Async Job Trigger**. Enqueues `template-generation`.
*   `GET /:slug`: Public endpoint. Logic checks `access` (free/paid). Returns full content or preview.
*   `POST /:id/publish`: Moves draft to published state and writes to file system.

### 3. Jobs (`/jobs`)
*   `POST /`: Generic job creation (Admin/System).
*   `GET /:id`: Polling endpoint for job status. Returns `progress`, `result`, or `error`.

### 4. Docs (`/docs`)
*   Served via `docsController`.
*   Protected by password (cookie-based) unless route is in public allowlist.
*   Renders server-side HTML using `src/templates/docs.html`.

## Request/Response Standards
*   **Success**: `{ success: true, data: { ... } }`
*   **Error**: `{ success: false, error: "Message" }`
*   **Pagination**: `list*` endpoints support query params, but currently return simple arrays (pagination logic exists in `firebaseUtils` but is opt-in).
