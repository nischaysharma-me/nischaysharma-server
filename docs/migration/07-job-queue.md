# Job Queue & Workers

The application handles long-running tasks using **BullMQ** (Redis-backed queue). This prevents the API from timing out during complex AI operations.

## Architecture
1.  **Producer (API)**: `src/services/jobService.js` adds jobs to the `taughtcode-jobs` queue.
2.  **Consumer (Worker)**: `src/workers/bullWorker.js` listens to the queue and processes jobs.
3.  **State Management**: Firestore acts as the source of truth for job status/history, while Redis manages the execution queue.

## Job Types (`src/workers/jobRegistry.js`)
The worker delegates logic based on the job name.

1.  **`article-generation`**:
    *   **Input**: `{ topic, depth, instructions, templateId }`
    *   **Action**: Calls `articleService.generateArticleContent`.
    *   **Output**: Created Article ID.
2.  **`template-generation`**:
    *   **Input**: `{ description, category }`
    *   **Action**: Calls `templateService.generateTemplate`.
    *   **Output**: Created Template ID.

## Job Lifecycle (State Machine)
1.  **API Request**: User calls `POST /articles/generate`.
2.  **Creation**:
    *   `Job` doc created in Firestore (`status: 'queued'`).
    *   Job added to Redis queue.
3.  **Processing**:
    *   Worker picks up job.
    *   Updates Firestore `status: 'processing'`.
    *   Executes logic.
4.  **Completion**:
    *   Logic returns success.
    *   Updates Firestore `status: 'completed'`, sets `result`, `completedAt`, `progress: 100`.
    *   `jobEvents` emits notification.
5.  **Failure**:
    *   Logic throws error.
    *   Updates Firestore `status: 'failed'`, sets `error`.

## Configuration
*   **Redis**: Configured in `src/config/queue.js`.
*   **Concurrency**: Set to 5 parallel jobs in `bullWorker.js`.
*   **Retries**: Default 3 attempts with exponential backoff.
