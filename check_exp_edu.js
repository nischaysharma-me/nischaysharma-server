import { db } from './src/config/firebase.js';

async function check() {
  const userId = 'XLkz85rGnXT1wD9S6cNuqQVvluE2';
  const exp = await db.collection('experience').where('userId', '==', userId).get();
  const edu = await db.collection('education').where('userId', '==', userId).get();
  
  console.log('--- Experience Collection ---');
  console.log('Count:', exp.size);
  exp.docs.forEach(doc => console.log(' - Company:', doc.data().company));
  
  console.log('--- Education Collection ---');
  console.log('Count:', edu.size);
  edu.docs.forEach(doc => console.log(' - School:', doc.data().school));
  
  process.exit(0);
}

check();
