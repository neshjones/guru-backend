const { db } = require('../config/firebase');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) return res.status(404).json({ message: 'User not found' });

    res.json(userDoc.data());
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    const updateData = req.body;

    await db.collection('users').doc(userId).update(updateData);

    res.json({ message: 'Profile updated' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
};
