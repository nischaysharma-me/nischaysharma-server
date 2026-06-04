import { db } from './src/config/firebase.js';

async function check() {
  const users = await db.collection('users').where('role', '==', 'admin').get();
  if (users.empty) {
    console.log('No admin found');
    process.exit(0);
  }
  const admin = users.docs[0].data();
  console.log('Admin UID:', admin.uid);
  console.log('Legacy Projects in User doc:', admin.projects ? admin.projects.length : 0);
  if (admin.projects) {
    admin.projects.forEach(p => console.log(' - Legacy Project:', p.title));
  }
  process.exit(0);
}

check();
