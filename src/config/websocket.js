import { Server } from 'socket.io';
import logger from '../utils/logger.js';
import { admin } from './firebase.js';

let io;

export const initWebSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || '*',
            methods: ['GET', 'POST']
        }
    });

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error: No token provided'));
            }

            // Verify Firebase token
            const decodedToken = await admin.auth().verifyIdToken(token);
            socket.userId = decodedToken.uid;
            
            const deviceId = socket.handshake.auth.deviceId;
            if (deviceId) {
                socket.deviceId = deviceId;
            }

            next();
        } catch (error) {
            logger.error(`WebSocket Auth Error: ${error.message}`);
            next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        logger.info(`WebSocket: Client connected [id=${socket.id}, user=${socket.userId}]`);

        // Join a room specific to the user for targeted emits
        socket.join(`user:${socket.userId}`);
        
        if (socket.deviceId) {
            socket.join(`device:${socket.deviceId}`);
        }

        socket.on('disconnect', () => {
            logger.info(`WebSocket: Client disconnected [id=${socket.id}]`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('WebSocket server not initialized');
    }
    return io;
};

export const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(`user:${userId}`).emit(event, data);
    }
};

export const emitToDevice = (deviceId, event, data) => {
    if (io) {
        io.to(`device:${deviceId}`).emit(event, data);
    }
};
