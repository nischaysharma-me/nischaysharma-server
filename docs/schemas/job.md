# Job Schema

Tracks the state and result of asynchronous background tasks managed by BullMQ.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `type` | String | Yes | Function name for the job (e.g., `article:generate`). |
| `data` | Object | Yes | Input parameters required by the worker. |
| `result` | Object | No | Final output of the worker upon completion. |
| `status` | String | Yes | Current state: `queued`, `processing`, `completed`, `failed`. |
| `progress` | Number | No | Completion percentage (0-100). |
| `error` | String | No | Serialized error message if the job failed. |
| `userId` | String | Yes | UID of the user who initiated the task. |
| `createdAt` | Date | Yes | Timestamp of submission. |
| `updatedAt` | Date | Yes | Timestamp of last status transition. |
| `completedAt` | Date | No | Precise timestamp of successful completion. |
