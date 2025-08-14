require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// ✅ CORS (Allow local frontend)
app.use(cors({
  origin: 'http://127.0.0.1:8080',
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true
}));

// ✅ Parse JSON
app.use(bodyParser.json());

// Firebase Admin SDK
const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  })
});
const db = admin.firestore();

// ✅ Auth routes (correct path for src folder)
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

// ✅ M-Pesa payment route
app.post('/payment', async (req, res) => {
  try {
    const { userId, mpesaCode } = req.body;

    if (!userId || !mpesaCode) {
      return res.status(400).json({ error: 'Missing userId or mpesaCode' });
    }

    if (process.env.MPESA_MODE === 'manual') {
      await db.collection('payments').add({
        userId,
        mpesaCode,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return res.json({
        message: 'Payment code received. Awaiting verification.'
      });
    } else {
      return res.status(400).json({ error: 'Invalid M-Pesa mode.' });
    }

  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Root route
app.get('/', (req, res) => {
  res.send('Guru Backend running...');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
