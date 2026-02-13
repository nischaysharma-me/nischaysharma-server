# Service Layer Documentation

The **Service Layer** (`src/services/`) encapsulates the business logic of the application. Controllers delegate specific tasks to these services.

## 1. `articleService.js`
Handles the lifecycle of articles.
*   **`generateArticleContent(authorId, topic, depth, instructions, templateId)`**:
    1.  Determines structure (either from an existing `ArticleTemplate` or generated via AI prompt).
    2.  Generates image prompts for each section (if structure requires).
    3.  Calls AI provider to generate images and uploads them via `storageService`.
    4.  Generates full HTML content using the structure and image URLs.
    5.  Saves the article as a `draft`.
*   **`publishArticle(id, authorId)`**:
    *   Verifies ownership.
    *   Minifies the HTML content.
    *   Writes the content to the local filesystem (`docs/articles/`) as a Markdown file (simulating a CMS publish).
    *   Updates status to `published`.
*   **`checkAccess(article, userId)`**: Implements the authorization logic for reading articles (Free vs. Paid vs. Subscription).

## 2. `jobService.js`
Manages the asynchronous task queue.
*   **`addJob(type, data, userId)`**:
    1.  Creates a `Job` document in Firestore with status `queued`.
    2.  Adds the job to the BullMQ queue (`taughtcode-jobs`) with the Firestore ID.
*   **`processJob(jobId)`**:
    *   Called by the Worker.
    *   Updates status to `processing`.
    *   Finds the worker function from `src/workers/jobRegistry.js`.
    *   Executes the worker function.
    *   Updates status to `completed` (with result) or `failed` (with error).
*   **Events**: Emits `statusUpdate` events on the `jobEvents` emitter.

## 3. `userProfileService.js`
Manages user data.
*   **`createUser`**: Creates a new user profile, ensuring uniqueness.
*   **`onboardUser`** (via Controller combination): Handles profile creation + optional Organization creation + Avatar upload.
*   **`getUser` / `getUserById`**: Retrieves user profile.
*   **`updateUser`**: Updates user fields (sanitized).

## 4. `docsService.js`
Handles the internal documentation portal.
*   **`getNavigationStructure(forceRefresh)`**: Scans the `docs/` directory recursively to build a sidebar navigation tree. Caches results.
*   **`getDocContent(routePath)`**: Securely reads a markdown file, parses it using `marked` (with custom Mermaid renderer), and returns HTML.
*   **Security**: Validates paths to prevent directory traversal.

## 5. `aiService.js`
A facade over the `AIProvider`.
*   Exposes `generateText`, `chat`, and `generateImage`.
*   Simplifies usage for other services so they don't need to import the registry directly.

## 6. `storageService.js`
A facade over the `StorageProvider`.
*   **`uploadUserAsset`**: Standardizes paths (`users/{userId}/{type}/{filename}`).
*   **`deleteFile`**: Handles deletion.

## 7. `apiKeyService.js`
Manages machine-to-machine access.
*   **`createApiKey`**: Generates a new key using `ApiKeyProvider`, hashes it, and stores the record. Returns the plain text key only once.
*   **`validateApiKey`**: Hashes the incoming key and looks it up in the database. Checks expiration and status.

## 8. `articleTemplateService.js`
*   **`generateTemplate`**: Uses AI to create a reusable JSON structure for articles based on a description.
*   **`incrementUsage`**: Tracks how many times a template is used.
