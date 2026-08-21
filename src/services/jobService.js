import { Job } from '../models/index.js';
import logger from '../utils/logger.js';
import { EventEmitter } from 'events';
import { getWorkerFunction } from '../workers/jobRegistry.js';
import { jobQueue } from '../workers/queueFactory.js';
import { realtimeDb } from '../config/firebase.js';
import { emitToUser } from '../config/websocket.js';

// Event Emitter for notifications
export const jobEvents = new EventEmitter();

/**
 * Add a job to the queue (Firestore + BullMQ)
 * @param {string} type - Job type (e.g., 'article-generation')
 * @param {Object} data - Payload
 * @param {string} userId - User initiating the job
 */
async function addJob(type, data, userId) {
    // 1. Persist in Firestore (Source of Truth)
    const job = await Job.create({
        type,
        data,
        userId,
        status: 'queued',
        progress: 0
    });

    logger.info(`Job persisted: ${job.id} (${type})`);

    // Emit via WebSocket
    emitToUser(userId, 'job:created', {
        id: job.id,
        type: job.type,
        status: job.status,
        progress: job.progress
    });

    // 2. Push to BullMQ (Execution Trigger)
    await jobQueue.add(type, {
        firestoreJobId: job.id,
        type,
        ...data
    });

    return job;
}

/**
 * Get job status
 * @param {string} jobId
 */
async function getJob(jobId) {
    const job = await Job.findById(jobId);
    if (!job) throw new Error('Job not found');
    return job;
}

/**
 * Process a job (Called by Worker)
 * @param {string} jobId
 */
async function processJob(jobId) {
    const job = await Job.findById(jobId);
    if (!job) return;

    // Double check status before running (concurrency safety)
    // Although BullMQ handles concurrency, this prevents reprocessing if manually triggered
    if (job.status !== 'queued' && job.status !== 'failed') return;

    // Transition to Processing
    await updateJobStatus(jobId, 'processing', 10);

    try {
        logger.info(`Processing job ${jobId} (${job.type})...`);

        const workerFn = getWorkerFunction(job.type);
        if (!workerFn) {
            throw new Error(`No worker registered for job type: ${job.type}`);
        }

        // Execute Worker Function
        // Convention: fn(userId, data)
        const result = await workerFn(job.userId, job.data);

        logger.info(`Job ${jobId} worker completed. Attempting to update status to completed.`);

        // Transition to Completed
        try {
            await updateJobStatus(jobId, 'completed', 100, result);
        } catch (updateError) {
            logger.error(`Job ${jobId}: Worker succeeded but status update to completed failed:`, updateError);
            throw updateError;
        }

    } catch (error) {
        logger.error(`Job ${jobId} execution failed:`, error);
        // Transition to Failed
        try {
            await updateJobStatus(jobId, 'failed', 0, null, error.message);
        } catch (statusError) {
            logger.error(`Job ${jobId}: Critical failure - could not mark job as failed:`, statusError);
        }
        throw error; // Rethrow so BullMQ knows it failed
    }
}

/**
 * Update job status (FSM transitions)
 */
async function updateJobStatus(jobId, status, progress, result = null, error = null) {
    logger.info(`JobService: Updating job ${jobId} status to ${status} (${progress}%)`);

    const updates = {
        status,
        progress,
        updatedAt: new Date()
    };

    if (result) {
        // Ensure result is a plain object and serialize any complex types safely
        try {
            updates.result = JSON.parse(JSON.stringify(result));
        } catch (e) {
            logger.warn(`Job ${jobId}: Could not serialize result, storing as string: ${e.message}`);
            updates.result = { raw: String(result) };
        }
    }

    if (error) updates.error = error;
    if (status === 'completed' || status === 'failed') updates.completedAt = new Date();

    const updatedJob = await Job.findByIdAndUpdate(jobId, updates, { new: true });

    if (!updatedJob) {
        throw new Error(`Could not find job ${jobId} to update status`);
    }

    // Sync to Realtime Database for client-side notifications
    if (updatedJob.userId) {
        // Sync to Realtime Database
        try {
            await realtimeDb.ref(`notifications/${updatedJob.userId}/jobs/${jobId}`).set({
                id: jobId,
                type: updatedJob.type,
                status: updatedJob.status,
                progress: updatedJob.progress,
                updatedAt: Date.now(),
                message: error || (status === 'completed' ? 'Job completed successfully' : null)
            });
        } catch (dbError) {
            logger.error(`Error syncing job ${jobId} to Realtime DB:`, dbError);
        }

        // Emit via WebSocket
        try {
            emitToUser(updatedJob.userId, `job:${status}`, {
                id: jobId,
                type: updatedJob.type,
                status: updatedJob.status,
                progress: updatedJob.progress,
                result: updates.result,
                error
            });

            emitToUser(updatedJob.userId, 'job:update', {
                id: jobId,
                type: updatedJob.type,
                status: updatedJob.status,
                progress: updatedJob.progress
            });
        } catch (emitError) {
            logger.error(`Error emitting job update for ${jobId}:`, emitError);
        }
    }

    // Notify
    jobEvents.emit('statusUpdate', updatedJob);
    logger.info(`Job ${jobId} status: ${status}`);

    return updatedJob;
}

export {
    addJob,
    getJob,
    processJob
};
