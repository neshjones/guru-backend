const express = require('express');
const router = express.Router();
const { submitPayment, verifyPayment } = require('../controllers/paymentcontroller');
const { verifyToken, verifyEmailVerified } = require('../middleware/authmiddleware');
const { adminOnly } = require('../middleware/adminmiddleware');

// User submits M-Pesa transaction code
router.post('/submit', verifyToken, verifyEmailVerified, submitPayment);

// Admin verifies payment manually
router.put('/verify/:paymentId', verifyToken, adminOnly, verifyPayment);

module.exports = router;
