// backend/src/routes/adminRoutes.js

const express = require('express');
const router = express.Router();

const {
  getAdminDashboard,
  listUsers,
  getUserById,
  updateUserRole,
  listJobs,
  updateJob,
  deleteJob,
  listPayments,
  listReferrals,
  importMpesaTransactions,
} = require('../controllers/adminController');

const { verifyToken } = require('../middleware/authmiddleware');
const { adminOnly } = require('../middleware/adminmiddleware');

// Apply authentication and admin role middleware to all admin routes
router.use(verifyToken, adminOnly);

// Dashboard overview
router.get('/dashboard', getAdminDashboard);

// User management routes
router.get('/users', listUsers);
router.get('/users/:userId', getUserById);
router.put('/users/:userId/role', updateUserRole);

// Job management routes
router.get('/jobs', listJobs);
router.put('/jobs/:jobId', updateJob);
router.delete('/jobs/:jobId', deleteJob);

// Payment management route
router.get('/payments', listPayments);

// Referral management route
router.get('/referrals', listReferrals);

// Bulk M-Pesa transactions import (admin only)
router.post('/mpesa-import', importMpesaTransactions);

module.exports = router;
