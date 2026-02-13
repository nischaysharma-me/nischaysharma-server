# Configuration & Environment

The application configuration is centralized in `src/config/` and loaded via `dotenv`.

## Environment Variables (`.env`)

### Server
*   `PORT`: HTTP port (default: 3000).
*   `NODE_ENV`: `development` | `production` | `test`.
*   `CORS_ORIGIN`: Allowed origins for CORS.
*   `API_VERSION`: API version prefix (default: `v1`).

### Firebase
*   `FIREBASE_DATABASE_URL`: URL for Realtime Database.
*   `FIREBASE_STORAGE_BUCKET`: Bucket name for storage.
*   **Service Account**: The app loads `taughtcode-firebase-adminsdk-fbsvc.json` from the root directory.

### Redis (Queue)
*   `REDIS_HOST`: Hostname (localhost).
*   `REDIS_PORT`: Port (6379).
*   `REDIS_PASSWORD`: Optional password.

### AI Providers
*   `AI_PROVIDER`: Active provider (`gemini`, `openai`, `anthropic`).
*   **Gemini**:
    *   `GEMINI_API_KEY`: API Key.
    *   `GEMINI_FLASH_MODEL`: Model name for fast tasks.
    *   `GEMINI_PRO_MODEL`: Model name for complex tasks.
*   **OpenAI**:
    *   `OPENAI_API_KEY`: API Key.
*   **Tools**:
    *   `GOOGLE_SEARCH_API_KEY`: For grounding.
    *   `GOOGLE_SEARCH_ENGINE_ID`: Custom Search Engine ID.

### Documentation
*   `DOCS_PASSWORD`: Password for accessing `/docs`.

## Config Files
*   **`ai.js`**: exports `AI_CONFIG`. Logic to fallback to defaults if env vars are missing.
*   **`docs.js`**: Exports `docsConfig` (public routes, session settings).
*   **`firebase.js`**: Exports initialized `admin`, `db`, `realtimeDb`. Note: This file executes side-effects (connection test) on import.
*   **`queue.js`**: Exports `connection` (Redis).
*   **`swagger.js`**: Exports `swaggerSpec` object generated from JSDoc comments.
