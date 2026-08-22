import { db } from './src/config/firebase.js';

async function run() {
    try {
        const users = await db.collection('users').get();
        users.forEach(doc => {
            const data = doc.data();
            console.log(`User ID: ${doc.id}`);
            console.log(`  displayName: ${data.displayName}`);
            console.log(`  email: ${data.email}`);
            console.log(`  role: ${data.role}`);
        });
    } catch (err) {
        console.error('Error:', err);
    }
    process.exit(0);
}

run();
