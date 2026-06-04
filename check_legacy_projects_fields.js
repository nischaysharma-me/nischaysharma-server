import { db } from './src/config/firebase.js';

async function check() {
  const users = await db.collection('users').where('role', '==', 'admin').get();
  if (users.empty) {
    process.exit(0);
  }
  const admin = users.docs[0].data();
  console.log('--- Legacy Projects Fields ---');
  if (admin.projects) {
    admin.projects.forEach(p => {
        console.log('Project:', p.title, '| Image:', p.image ? 'YES' : 'NO');
    });
  }
  process.exit(0);
}

check();
