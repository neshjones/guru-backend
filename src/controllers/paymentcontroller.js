const { db, admin } = require('../config/firebase');

// User submits manual M-Pesa payment code for verification
exports.submitPayment = async (req, res) => {
  try {
    const { userId, transactionCode, accountType, amount } = req.body;

    if (!userId || !transactionCode || !accountType || !amount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify transaction code format (simple validation example)
    if (!/^[A-Z0-9]{10,15}$/.test(transactionCode)) {
      return res.status(400).json({ message: 'Invalid transaction code format' });
    }

    // Check if transaction code already used
    const paymentQuery = await db.collection('payments').where('transactionCode', '==', transactionCode).get();
    if (!paymentQuery.empty) {
      return res.status(400).json({ message: 'This transaction code has already been used' });
    }

    await db.collection('payments').add({
      userId,
      transactionCode,
      accountType,
      amount,
      status: 'pending',
      createdAt: new Date()
    });

    res.status(201).json({ message: 'Payment submitted. Awaiting verification.' });
  } catch (error) {
    console.error('Payment submit error:', error);
    res.status(500).json({ message: 'Payment submission failed' });
  }
};

// Admin verifies or rejects payment
exports.verifyPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { verified } = req.body;

    if (typeof verified !== 'boolean') {
      return res.status(400).json({ message: 'Verified flag boolean is required' });
    }

    const paymentRef = db.collection('payments').doc(paymentId);
    const paymentDoc = await paymentRef.get();

    if (!paymentDoc.exists) return res.status(404).json({ message: 'Payment not found' });

    await paymentRef.update({ status: verified ? 'verified' : 'rejected', verifiedAt: new Date() });

    if (verified) {
      const { userId, amount, accountType } = paymentDoc.data();

      // Mark user's payment as verified and activate account
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) return res.status(404).json({ message: 'User not found' });

      const userData = userDoc.data();

      // Update user doc:
      await userRef.update({
        paymentVerified: true,
        accountActive: true,
        balance: (userData.balance || 0) + amount
      });

      // Referral reward already credited on registration, so no double-pay here

    }

    res.json({ message: `Payment ${verified ? 'verified' : 'rejected'}` });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
};
