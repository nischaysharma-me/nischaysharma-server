import { User } from './src/models/index.js';

async function run() {
    try {
        const users = await User.find({});
        console.log('USERS IN DB:');
        console.log(JSON.stringify(users, null, 2));
    } catch (err) {
        console.error('Error:', err);
    }
    process.exit(0);
}

run();
