import { Worker } from 'bullmq';
import { connection } from '../config/queue.js';
import * as jobService from '../services/jobService.js';
import logger from '../utils/logger.js';

const QUEUE_NAME = 'taughtcode-jobs';

export function startBullWorker() {
    const worker = new Worker(QUEUE_NAME, async (job) => {
        logger.info(`BullWorker: Processing ${job.name} (Job ID: ${job.id})`);
        
        const { firestoreJobId } = job.data;
        
        if (!firestoreJobId) {
            throw new Error('Missing firestoreJobId in job data');
        }

        // Delegate execution to the JobService logic
        // This handles FSM state updates (processing -> completed/failed)
        await jobService.processJob(firestoreJobId);

    }, {
        connection,
        concurrency: 5, // Process 5 jobs in parallel
        limiter: {
            max: 10,
            duration: 1000
        }
    });

    worker.on('completed', (job) => {
        logger.info(`BullWorker: Job ${job.id} completed!`);
    });

    worker.on('failed', (job, err) => {
        logger.error(`BullWorker: Job ${job.id} failed: ${err.message}`);
    });

    logger.info(`🚀 BullMQ Worker Started: ${QUEUE_NAME}`);
}
