import { db } from './src/config/firebase.js';

async function run() {
    try {
        const collections = await db.listCollections();
        console.log('COLLECTIONS IN FIRESTORE:');
        collections.forEach(c => console.log('- ', c.id));
    } catch (err) {
        console.error('Error:', err);
    }
    process.exit(0);
}

run();
