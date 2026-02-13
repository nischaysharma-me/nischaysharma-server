# Infrastructure: Job Queue Setup

The TaughtCode server uses **BullMQ** backed by **Redis** to handle asynchronous background jobs (e.g., AI content generation).

## Requirements

- **Redis**: Version 6.2 or higher is recommended.

## Configuration

The queue connection is configured via environment variables in `.env`:

```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password # Optional
```

## Architecture

1.  **Producer (API)**: When `enqueueJob` middleware is hit, a job is added to the `taughtcode-jobs` queue in Redis AND a `Job` document is created in Firestore (for long-term status tracking).
2.  **Consumer (Worker)**: The `BullWorker` listens to the Redis queue. When it picks up a job:
    -   It retrieves the `firestoreJobId`.
    -   It calls the appropriate service function from the `JOB_REGISTRY`.
    -   It updates the Firestore document status (`processing` -> `completed`/`failed`).

## Troubleshooting

-   **Jobs stuck in "queued"**: Ensure Redis is running and the worker process is active (`startBullWorker` in `src/app.js`).
-   **Connection Refused**: Check `REDIS_HOST` and `REDIS_PORT`.
