import { db } from './src/config/firebase.js';

const bhedStackItems = [
  {
    title: "LET'S MAKE SOMETHING",
    description: "Need more information\n\nGet in touch\n\nReach me:\nkushwaha.ved@gmail.com",
    link: "mailto:kushwaha.ved@gmail.com",
    linkType: "external",
    color: "#111111",
    imageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1000",
    order: 0,
    isActive: true,
    icon: "ph-envelope"
  },
  {
    title: "My Portfolio",
    description: "Color Guessing Game",
    link: "https://github.com/kushwahaved",
    linkType: "external",
    color: "#1a1525",
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000",
    order: 1,
    isActive: true,
    icon: "ph-code"
  },
  {
    title: "Alumni",
    description: "Welcome Back!",
    link: "https://github.com/kushwahaved",
    linkType: "external",
    color: "#1e293b",
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000",
    order: 2,
    isActive: true,
    icon: "ph-graduation-cap"
  },
  {
    title: "About Me",
    description: "My name is Bhed Kumar Kushwaha, Software Engineer at Darwinbox. My interests include Full Stack Web Development, Data Science and Machine Learning. I have diverse set of skills, ranging from design, to HTML + CSS + JavaScript, all the way to Python, Django, Go.",
    link: "/about",
    linkType: "internal",
    color: "#312e81",
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000",
    order: 3,
    isActive: true,
    icon: "ph-user"
  },
  {
    title: "Hi, I'm Bhed,",
    description: "Welcome To My Portfolio",
    link: "/",
    linkType: "internal",
    color: "#0f172a",
    imageUrl: "https://storage.googleapis.com/nischaysharma-com.firebasestorage.app/users/system/stack_images/1783084327109_u48lq.jpeg",
    order: 4,
    isActive: true,
    icon: "ph-hand-waving"
  }
];

async function seed() {
  try {
    console.log('Clearing old stack items...');
    const snapshot = await db.collection('stack_items').get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log('Old stack items cleared.');

    console.log('Seeding Bhed portfolio stack items...');
    for (const item of bhedStackItems) {
      await db.collection('stack_items').add({
        ...item,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  }
  process.exit(0);
}

seed();
