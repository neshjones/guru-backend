const { admin } = require('../config/firebase');

exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const idToken = authHeader.split(' ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

exports.verifyEmailVerified = async (req, res, next) => {
  // Middleware to ensure email is verified
  if (!req.user.email_verified) {
    return res.status(403).json({ message: 'Email not verified' });
  }
  next();
};
