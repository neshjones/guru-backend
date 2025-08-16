require('dotenv').config();
const admin = require('firebase-admin');

try {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  };

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  console.log('Firebase initialized successfully!');

  const db = admin.firestore();
  
  // Try a simple Firestore read (replace 'test' with any collection name)
  db.collection('test').limit(1).get()
    .then(snapshot => {
      console.log('Firestore access successful. Documents count:', snapshot.size);
      process.exit(0);
    })
    .catch(err => {
      console.error('Firestore access failed:', err);
      process.exit(1);
    });

} catch (error) {
  console.error('Firebase initialization failed:', error);
}
