import * as jobService from '../services/jobService.js';

/**
 * Create a new job
 */
const createJob = async (req, res) => {
    try {
        const { uid } = req.user;
        const { type, data } = req.body;

        if (!type || !data) {
            return res.status(400).json({ success: false, error: 'Type and data are required' });
        }

        // Add authorId to data if not present, useful for workers
        if (!data.authorId) data.authorId = uid;

        const job = await jobService.addJob(type, data, uid);

        res.status(202).json({ // Accepted
            success: true,
            data: {
                jobId: job.id,
                status: job.status,
                message: 'Job queued successfully'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Get job status
 */
const getJobStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await jobService.getJob(id);

        if (req.user.uid !== job.userId && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

        res.json({
            success: true,
            data: job
        });
    } catch (error) {
        res.status(404).json({ success: false, error: error.message });
    }
};

export {
    createJob,
    getJobStatus
};
