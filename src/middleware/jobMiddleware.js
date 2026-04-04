import * as jobService from '../services/jobService.js';

/**
 * Middleware to convert a request into a background job
 * @param {string} jobType - The type key for the job registry
 */
export const enqueueJob = (jobType) => {
    return async (req, res, next) => {
        try {
            const { uid } = req.user;
            const data = req.body;

            // Enqueue the job
            const job = await jobService.addJob(jobType, data, uid);

            // Respond immediately
            res.status(202).json({
                success: true,
                data: {
                    jobId: job.id,
                    status: 'queued',
                    message: 'Request accepted for background processing',
                    queuePosition: 1 // Mock
                }
            });
        } catch (error) {
            next(error);
        }
    };
};
