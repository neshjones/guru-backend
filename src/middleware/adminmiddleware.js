const { db } = require('../config/firebase');

exports.adminOnly = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return res.status(403).json({ message: 'Access denied: user not found' });
    }
    const userData = userDoc.data();
    if (userData.role !== 'admin') {
      return res.status(403).json({ message: 'Admin privileges required' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Authorization check failed' });
  }
};
