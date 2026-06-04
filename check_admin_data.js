import { db } from './src/config/firebase.js';

async function check() {
  const users = await db.collection('users').where('role', '==', 'admin').get();
  if (users.empty) {
    console.log('No admin found');
    process.exit(0);
  }
  const admin = users.docs[0].data();
  console.log('--- Legacy Experience ---');
  console.log(JSON.stringify(admin.experience, null, 2));
  console.log('--- Legacy Education ---');
  console.log(JSON.stringify(admin.education, null, 2));
  process.exit(0);
}

check();
