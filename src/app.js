import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import 'dotenv/config';
import initNotificationHandler from './services/notificationHandler.js/index.js';
import { startBullWorker } from './workers/bullWorker.js';
import { getClientAppByUrl } from './services/clientAppService.js';

const app = express();

// Initialize Notifications
initNotificationHandler();

// Start Background Worker (BullMQ)
startBullWorker();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false // Allow Swagger UI to work
}));

// CORS configuration
app.use(cors({
    origin: async (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        // Allow static configured origin
        const allowedOrigin = process.env.CORS_ORIGIN || '*';
        if (allowedOrigin === '*' || allowedOrigin === origin) {
            return callback(null, true);
        }

        // Allow localhost in development
        if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
            return callback(null, true);
        }

        try {
            // Check if origin is whitelisted in any global client application
            const clientApp = await getClientAppByUrl(origin);
            if (clientApp) {
                return callback(null, true);
            }
        } catch (error) {
            console.error('CORS validation error:', error);
        }

        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

// Cookie parser middleware
app.use(cookieParser());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
}

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'TaughtCode API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
        persistAuthorization: true, // Persist auth token in Swagger UI
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true
    }
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Documentation routes (password protected)
import docsRoutes from './routes/docs.js';
app.use('/docs', docsRoutes);

// API routes
import apiRoutes from './routes/index.js';
const API_VERSION = process.env.API_VERSION || 'v1';
const BASE_PATH = process.env.BASE_PATH || '/api';

app.use(`${BASE_PATH}/${API_VERSION}`, apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'TaughtCode API',
        version: process.env.APP_VERSION || '1.0.0',
        api: `${BASE_PATH}/${API_VERSION}`,
        docs: {
            swagger: '/api-docs',
            swaggerJson: '/api-docs.json',
            markdown: '/docs'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);

    res.status(err.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message
    });
});

export default app;

