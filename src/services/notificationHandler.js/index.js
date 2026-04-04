import { jobEvents } from '../jobService.js';
import logger from '../../utils/logger.js';

// Subscribe to job events
jobEvents.on('statusUpdate', (job) => {
    logger.log(`🔔 Notification: Job ${job.id} is now ${job.status}`);
    
    if (job.status === 'completed') {
        // Here we would push a notification to the user via WebSocket or Push Notification
        // notifying them that their "Order" (Job) is ready.
        logger.log(`✅ Success! User ${job.userId} can now check their result.`);
        // Example: sendPushNotification(job.userId, "Your article is ready!");
    } else if (job.status === 'failed') {
        logger.error(`❌ Job ${job.id} failed: ${job.error}`);
        // Example: sendPushNotification(job.userId, "Your job failed. Please try again.");
    }
});

export default function initNotificationHandler() {
    logger.info('Notification Handler Initialized');
}