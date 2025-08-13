require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Example: Firebase Admin SDK init
const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  })
});
const db = admin.firestore();

// M-Pesa payment route
app.post('/payment', async (req, res) => {
  try {
    const { userId, mpesaCode } = req.body;

    if (!userId || !mpesaCode) {
      return res.status(400).json({ error: 'Missing userId or mpesaCode' });
    }

    if (process.env.MPESA_MODE === 'manual') {
      // Save payment code for manual verification
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
      // If you later switch to Daraja API mode, add that logic here
      return res.status(400).json({ error: 'Invalid M-Pesa mode.' });
    }

  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/', (req, res) => {
  res.send('Guru Backend running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
