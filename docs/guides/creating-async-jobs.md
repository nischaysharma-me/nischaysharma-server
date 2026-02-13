# How to Create an Async Job

To improve performance and user experience, heavy tasks (like AI generation) should be processed in the background. We use a **Job Queue** system with a **Plug-and-Play Middleware**.

## 1. Create Your Service Function

Write your business logic in a service file. The function **must** accept `userId` and a `data` object as arguments.

```javascript
// src/services/reportService.js
export async function generateReport(userId, data) {
    const { reportType, dateRange } = data;
    // ... long running process ...
    return { url: 'https://storage.../report.pdf' };
}
```

## 2. Register the Job

Add your service function to the `JOB_REGISTRY` in `src/workers/jobRegistry.js`. This maps a string key (Job Type) to your function.

```javascript
// src/workers/jobRegistry.js
import * as reportService from '../services/reportService.js';

export const JOB_REGISTRY = {
    // ... other jobs
    'report-generation': async (userId, data) => {
        return reportService.generateReport(userId, data);
    }
};
```

## 3. Use the Middleware in Routes

In your route file, instead of calling a controller, use `enqueueJob('job-type')`.

```javascript
// src/routes/reports.js
import { enqueueJob } from '../middleware/jobMiddleware.js';

router.post('/generate', 
    isAuthenticated,
    // validateRequest(schema), // Optional validation
    enqueueJob('report-generation') // <--- Magic happens here
);
```

## 4. Client-Side Handling

The API will now respond immediately with:

```json
{
    "success": true,
    "data": {
        "jobId": "job_12345",
        "status": "queued",
        "message": "Request accepted for background processing"
    }
}
```

The client should poll `GET /api/v1/jobs/{jobId}` to check the status (`queued`, `processing`, `completed`). When `completed`, the `result` field will contain the return value of your service function.
