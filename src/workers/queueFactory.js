import { Queue } from 'bullmq';
import { connection } from '../config/queue.js';
import logger from '../utils/logger.js';

const QUEUE_NAME = 'taughtcode-jobs';

// Create the Queue instance (Producer)
export const jobQueue = new Queue(QUEUE_NAME, {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: {
            age: 24 * 3600, // Keep for 24 hours
            count: 1000,
        },
        removeOnFail: {
            age: 7 * 24 * 3600, // Keep failed for 7 days
        },
    },
});

logger.info(`Queue initialized: ${QUEUE_NAME}`);
