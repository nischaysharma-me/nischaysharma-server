# Folder Structure Explained

## `/src`
The application logic resides in the `src/` directory, following a layered architecture.

### Root Files
*   **`src/app.js`**:
    *   **Purpose**: Bootstraps the Express application.
    *   **Core Functions**: Sets up global middleware (`cors`, `helmet`, `morgan`, `cookieParser`), initializes Swagger documentation (`/api-docs`), mounts main routes (`/api/v1` and `/docs`), and sets up error handling.
    *   **Notification Integration**: Calls `initNotificationHandler()` to listen for job events.
    *   **Worker Start**: Calls `startBullWorker()` to begin processing background tasks.
*   **`src/server.js`**:
    *   **Purpose**: The application entry point.
    *   **Core Functions**: Connects to the database (`Firebase`), invalidates documentation cache, and starts the HTTP server. Handles graceful shutdown signals (`SIGTERM`, `SIGINT`).

### `src/config/`
Configuration files that centralize environment variables and setup logic.
*   **`src/config/ai.js`**: Defines AI provider settings (Gemini, OpenAI, Anthropic), models, and generation parameters. Exports a unified `AI_CONFIG` object.
*   **`src/config/docs.js`**: Manages documentation access control (password protection, public routes) and session cookie settings.
*   **`src/config/firebase.js`**: Initializes the Firebase Admin SDK using service account credentials and exports `admin`, `db` (Firestore), and `realtimeDb` instances. Includes a connectivity test.
*   **`src/config/queue.js`**: Configures the Redis connection for BullMQ.
*   **`src/config/swagger.js`**: Sets up Swagger/OpenAPI definitions using `swagger-jsdoc`.

### `src/controllers/`
Handles incoming HTTP requests, extracts parameters, and calls the appropriate service methods.
*   **`src/controllers/articleController.js`**: Logic for creating, reading, updating, generating, and reviewing articles.
*   **`src/controllers/articleTemplateController.js`**: Logic for managing and generating article templates.
*   **`src/controllers/docsController.js`**: Serves the documentation portal pages (`listDocs`, `getDoc`) and handles documentation login.
*   **`src/controllers/jobController.js`**: Handles job creation (`createJob`) and status retrieval (`getJobStatus`).
*   **`src/controllers/userProfileController.js`**: Manages user onboarding, profile updates, and admin actions (disable/activate).

### `src/middleware/`
Express middleware for cross-cutting concerns.
*   **`src/middleware/apiKeyAuth.js`**: Validates `x-api-key` headers for machine-to-machine authentication.
*   **`src/middleware/auth.js`**: Core authentication logic (`isAuthenticated`, `optionalAuth`) supporting both Bearer tokens (Firebase) and API Keys.
*   **`src/middleware/docsAuth.js`**: Protects documentation routes based on `docsConfig`.
*   **`src/middleware/jobMiddleware.js`**: Provides `enqueueJob` helper to automatically convert a request into a background job.
*   **`src/middleware/upload.js`**: Multer configuration for handling file uploads (in-memory).
*   **`src/middleware/validateRequest.js`**: Generic middleware factory for Joi schema validation.

### `src/models/`
Defines data schemas and interactions using the custom `FirebaseModel` wrapper.
*   **`src/models/index.js`**: Central export point for all models (`User`, `Article`, `Job`, etc.).
*   **`src/models/apiKeyModel.js`**: Schema for API Keys.
*   **`src/models/articleModel.js`**: Schema for articles, including status, access control, and metrics.
*   **`src/models/articleTemplateModel.js`**: Schema for reusable article structures.
*   **`src/models/jobModel.js`**: Schema for tracking background job state and results.
*   **`src/models/organizationModel.js`**: Schema for organizations.
*   **`src/models/userProfileModel.js`**: Schema for user profiles.
*   **`src/models/reviewModel.js`**, **`src/models/tagModel.js`**: Schemas for reviews and tags.

### `src/prompts/`
Contains prompt templates for AI interactions.
*   **`src/prompts/articlePrompts.js`**: Prompts for generating article structures, content, and templates.

### `src/providers/`
Implements the **Provider Pattern** to abstract external services.
*   **`src/providers/ai/`**: Base class and implementations for AI providers (Gemini, etc.). Includes a registry.
*   **`src/providers/auth/`**: Base class and implementations for Auth providers (Firebase, API Key).
*   **`src/providers/storage/`**: Base class and implementations for Storage providers (Firebase Storage).

### `src/routes/`
Defines API endpoints and mounts controllers/middleware.
*   **`src/routes/index.js`**: Main router aggregator.
*   **`src/routes/articles.js`**: Article-related endpoints.
*   **`src/routes/docs.js`**: Documentation portal routes.
*   **`src/routes/jobs.js`**: Job management endpoints.
*   **`src/routes/userProfile.js`**: User profile endpoints.

### `src/schemas/`
*   **`src/schemas/blogSchemaGemini.js`**: Defines JSON schemas for structured AI outputs (if supported by provider).

### `src/services/`
Contains the core business logic.
*   **`src/services/aiService.js`**: Facade for interacting with AI providers.
*   **`src/services/apiKeyService.js`**: Logic for creating and validating API keys.
*   **`src/services/articleService.js`**: Complex logic for article generation, publishing, and access control.
*   **`src/services/articleTemplateService.js`**: Logic for template management.
*   **`src/services/authService.js`**: Helper for user authentication verification.
*   **`src/services/docsService.js`**: Logic for reading, parsing (Markdown/Mermaid), and caching documentation files.
*   **`src/services/jobService.js`**: Manages job persistence (Firestore) and queueing (BullMQ). Handles state transitions.
*   **`src/services/storageService.js`**: Facade for storage operations.
*   **`src/services/userProfileService.js`**: Logic for user CRUD operations.
*   **`src/services/notificationHandler.js`**: Listens to job events and handles notifications.

### `src/templates/`
HTML templates for the documentation portal.
*   **`src/templates/docs.html`**: Main documentation layout.
*   **`src/templates/docs-login.html`**: Login page for protected docs.

### `src/tools/`
Defines tools available to AI models (e.g., Google Search).
*   **`src/tools/base.js`**: Base class for tools.
*   **`src/tools/googleSearch.js`**: Implementation of Google Custom Search tool.
*   **`src/tools/registry.js`**: Registry to manage and retrieve available tools.

### `src/utils/`
Shared utility functions.
*   **`src/utils/firebaseModel.js`**: The custom ORM-like wrapper for Firestore.
*   **`src/utils/firebaseUtils.js`**: Helpers for batch writes, pagination, and population.
*   **`src/utils/htmlMinifier.js`**: Simple HTML minification.
*   **`src/utils/logger.js`**: Centralized logging utility.
*   **`src/utils/templateRenderer.js`**: Logic for rendering the HTML templates in `src/templates/`.

### `src/validation/`
Joi validation schemas.
*   **`src/validation/articleSchemas.js`**: Schemas for article creation/updates.
*   **`src/validation/userSchemas.js`**: Schemas for user onboarding/updates.

### `src/workers/`
Background job processing logic.
*   **`src/workers/bullWorker.js`**: The main BullMQ worker setup and event listeners.
*   **`src/workers/jobRegistry.js`**: Maps job types to service functions.
*   **`src/workers/queueFactory.js`**: Creates and exports the BullMQ queue instance.
