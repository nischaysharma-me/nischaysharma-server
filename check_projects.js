import { Project, User } from './src/models/index.js';
import { db } from './src/config/firebase.js';

async function check() {
  const users = await db.collection('users').where('role', '==', 'admin').get();
  if (users.empty) {
    console.log('No admin found');
    process.exit(0);
  }
  const admin = users.docs[0].data();
  console.log('Admin UID:', admin.uid);
  
  const projects = await db.collection('projects').get();
  console.log('Total projects:', projects.size);
  projects.docs.forEach(doc => {
    const data = doc.data();
    console.log('Project:', data.title, 'UserId:', data.userId, 'Image:', data.image);
  });
  process.exit(0);
}

check();
