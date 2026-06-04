import { db } from './src/config/firebase.js';

async function check() {
  const projects = await db.collection('projects').get();
  console.log('Total projects in collection:', projects.size);
  projects.docs.forEach(doc => {
    console.log('--- Project ID:', doc.id, '---');
    console.log(JSON.stringify(doc.data(), null, 2));
  });
  process.exit(0);
}

check();
