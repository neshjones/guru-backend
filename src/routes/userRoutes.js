const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/usercontroller');
const { verifyToken, verifyEmailVerified } = require('../middleware/authmiddleware');

router.get('/profile', verifyToken, verifyEmailVerified, getProfile);
router.put('/profile', verifyToken, verifyEmailVerified, updateProfile);

module.exports = router;
