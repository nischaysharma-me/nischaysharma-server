import { StackItem } from './src/models/index.js';
import logger from './src/utils/logger.js';

async function run() {
    try {
        const items = await StackItem.find({}, { sort: { order: 1 } });
        console.log('ACTIVE STACK ITEMS IN DB:');
        console.log(JSON.stringify(items, null, 2));
    } catch (err) {
        console.error('Error:', err);
    }
    process.exit(0);
}

run();
