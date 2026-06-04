import { db } from './src/config/firebase.js';

async function check() {
  const projects = await db.collection('projects').get();
  console.log('Total projects in collection:', projects.size);
  projects.docs.forEach(doc => {
    const data = doc.data();
    console.log(' - Title:', data.title, '| userId:', data.userId, '| ID:', doc.id);
  });
  process.exit(0);
}

check();
