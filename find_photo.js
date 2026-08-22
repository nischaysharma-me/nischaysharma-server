import { User } from './src/models/index.js';

async function run() {
    try {
        const users = await User.find({ role: 'admin' });
        if (users.length > 0) {
            console.log('ADMIN PHOTO URL:', users[0].photoURL);
        } else {
            console.log('No admin found');
        }
    } catch (err) {
        console.error('Error:', err);
    }
    process.exit(0);
}

run();
