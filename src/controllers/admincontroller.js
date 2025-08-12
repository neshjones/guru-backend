const { db, admin } = require('../config/firebase');

exports.getAdminDashboard = async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const jobsSnapshot = await db.collection('jobs').where('active', '==', true).get();
    const paymentsSnapshot = await db.collection('payments').where('status', '==', 'pending').get();
    const referralsSnapshot = await db.collection('referrals').get();

    res.json({
      totalUsers: usersSnapshot.size,
      activeJobs: jobsSnapshot.size,
      pendingPayments: paymentsSnapshot.size,
      totalReferrals: referralsSnapshot.size,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch admin dashboard data' });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = [];
    snapshot.forEach(doc => users.push({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to list users' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const doc = await db.collection('users').doc(req.params.userId).get();
    if (!doc.exists) return res.status(404).json({ message: 'User not found' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get user' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    await db.collection('users').doc(req.params.userId).update({ role });
    res.json({ message: 'User role updated' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user role' });
  }
};

exports.listJobs = async (req, res) => {
  try {
    const snapshot = await db.collection('jobs').get();
    const jobs = [];
    snapshot.forEach(doc => jobs.push({ id: doc.id, ...doc.data() }));
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to list jobs' });
  }
};

exports.updateJob = async (req, res) => {
  try {
    await db.collection('jobs').doc(req.params.jobId).update(req.body);
    res.json({ message: 'Job updated' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update job' });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    await db.collection('jobs').doc(req.params.jobId).update({ active: false });
    res.json({ message: 'Job deleted (deactivated)' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete job' });
  }
};

exports.listPayments = async (req, res) => {
  try {
    const snapshot = await db.collection('payments').get();
    const payments = [];
    snapshot.forEach(doc => payments.push({ id: doc.id, ...doc.data() }));
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to list payments' });
  }
};

exports.listReferrals = async (req, res) => {
  try {
    const snapshot = await db.collection('referrals').get();
    const referrals = [];
    snapshot.forEach(doc => referrals.push({ id: doc.id, ...doc.data() }));
    res.json(referrals);
  } catch (error) {
    res.status(500).json({ message: 'Failed to list referrals' });
  }
};

// Bulk import M-Pesa transactions (admin only)
exports.importMpesaTransactions = async (req, res) => {
  try {
    const transactions = req.body.transactions; 
    if (!Array.isArray(transactions)) 
      return res.status(400).json({ message: 'transactions array is required' });

    const results = [];
    for (const tx of transactions) {
      const { transactionCode, amount, userId } = tx;

      if (!transactionCode || !amount || !userId) {
        results.push({ transactionCode, status: 'failed', reason: 'Missing code, amount, or userId' });
        continue;
      }

      // Check for duplicate
      const existing = await db.collection('payments').where('transactionCode', '==', transactionCode).get();

      if (!existing.empty) {
        results.push({ transactionCode, status: 'skipped', reason: 'Transaction code already used' });
        continue;
      }

      // Create payment and mark verified
      await db.collection('payments').add({
        transactionCode,
        amount,
        status: 'verified',
        verifiedAt: new Date(),
        createdAt: new Date(),
        userId
      });

      // Update user account active and balance
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        await userRef.update({
          paymentVerified: true,
          accountActive: true,
          balance: (userData.balance || 0) + amount
        });
      }

      results.push({ transactionCode, status: 'verified' });
    }

    res.json({ results });
  } catch (error) {
    console.error('M-Pesa bulk import error:', error);
    res.status(500).json({ message: 'Failed to import transactions' });
  }
};
