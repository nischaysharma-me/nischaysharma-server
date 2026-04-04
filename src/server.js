import app from './app.js';
// import database from './config/database.js';
import { db } from './config/firebase.js';
import logger from './utils/logger.js';
import { initWebSocket } from './config/websocket.js';

// Ensure all models are registered before connecting to database
// This prevents "Schema hasn't been registered" errors
import './models/index.js';

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Start the server
 */
async function startServer() {
    try {
        // Connect to database (MongoDB - optional if using Firestore)
        try {
            // await database.connect();
        } catch (error) {
            logger.warn('⚠️  MongoDB not available, continuing with Firestore only');
        }

        // Firestore is initialized when firebase.js is imported
        logger.log('✅ Firestore initialized');

        // Invalidate documentation cache on server start
        const { invalidateNavigationCache } = await import('./services/docsService.js');
        invalidateNavigationCache();
        logger.log('📚 Documentation cache invalidated on server start');

        // Start Express server
        const server = app.listen(PORT, () => {
            logger.log(`🚀 Server running on port ${PORT} in ${NODE_ENV} mode`);
            logger.log(`📚 API available at http://localhost:${PORT}/api/v1`);
            logger.log(`📖 Documentation available at http://localhost:${PORT}/docs`);
            logger.log(`🔧 Swagger UI available at http://localhost:${PORT}/api-docs`);
        });

        // Initialize WebSockets
        initWebSocket(server);

        // Graceful shutdown
        process.on('SIGTERM', async () => {
            logger.log('SIGTERM received, shutting down gracefully...');
            server.close(async () => {
                await database.disconnect();
                process.exit(0);
            });
        });

        process.on('SIGINT', async () => {
            logger.log('SIGINT received, shutting down gracefully...');
            server.close(async () => {
                // await database.disconnect();
                process.exit(0);
            });
        });

        return server;
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Start server if this file is run directly
// In ES modules, check if this is the main module
import { pathToFileURL } from 'url';
if (import.meta.url === pathToFileURL(process.argv[1]).href || process.env.PM2_HOME) {
    startServer();
}

export default startServer;