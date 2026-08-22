import { db } from './src/config/firebase.js';

const originalItems = [
  {
    title: "Documents",
    link: "/docs",
    linkType: "internal",
    icon: "ph-link",
    color: "#000000",
    order: 0,
    isActive: true,
    description: "THis is the documentation link ",
    imageUrl: "https://storage.googleapis.com/nischaysharma-com.firebasestorage.app/users/system/stack_images/1783083192238_uybq3.jpeg"
  },
  {
    title: "Articles",
    link: "/articles",
    linkType: "internal",
    icon: "ph-link",
    color: "#000000",
    description: "Background for Articles page",
    order: 1,
    isActive: true,
    imageUrl: "https://storage.googleapis.com/nischaysharma-com.firebasestorage.app/users/system/stack_images/1783084327109_u48lq.jpeg"
  }
];

async function restore() {
  try {
    console.log('Clearing current stack items...');
    const snapshot = await db.collection('stack_items').get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log('Stack items cleared.');

    console.log('Restoring original stack items...');
    for (const item of originalItems) {
      await db.collection('stack_items').add({
        ...item,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    console.log('Restore completed successfully!');
  } catch (err) {
    console.error('Error during restore:', err);
  }
  process.exit(0);
}

restore();
