const express = require('express');
const router = express.Router();
const { getReferrals } = require('../controllers/referralcontroller');
const { verifyToken, verifyEmailVerified } = require('../middleware/authmiddleware');

router.get('/', verifyToken, verifyEmailVerified, getReferrals);

module.exports = router;
