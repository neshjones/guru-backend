const { db, admin } = require('../config/firebase');

exports.getReferrals = async (req, res) => {
  try {
    const userId = req.user.uid;
    const snapshot = await db.collection('referrals').where('referrerId', '==', userId).get();
    const referrals = [];
    snapshot.forEach(doc => referrals.push({ id: doc.id, ...doc.data() }));
    res.json(referrals);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch referrals' });
  }
};
