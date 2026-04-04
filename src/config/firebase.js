import admin from 'firebase-admin';
import serviceAccount from '../../taughtcode-firebase-adminsdk-fbsvc.json' with { type: 'json' };
import logger from '../utils/logger.js';

const databaseURL = process.env.FIREBASE_DATABASE_URL;
if (!databaseURL) {
    throw new Error('FIREBASE_DATABASE_URL environment variable is required');
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

// const db = admin.firestore();
// const realtimeDb = admin.database();

const db = admin.firestore();
const realtimeDb = admin.database();

// --- Test connectivity ---
async function testFirebaseConnection() {
    try {
        await db.collection('testConnection').doc('ping').set({ timestamp: Date.now() });
        logger.log("🔥 Firestore connected successfully!");
    } catch (err) {
        logger.error("❌ Firestore connection failed:", err);
    }

    realtimeDb.ref("testConnection/ping").set(Date.now())
        .then(() => logger.log("🔌 Realtime Database connected successfully!"))
        .catch((error) => logger.error("❌ Realtime Database connection failed:", error));
}

testFirebaseConnection();

export { admin, db, realtimeDb };