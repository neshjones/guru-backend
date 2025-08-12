const express = require('express');
const router = express.Router();
const {
  listJobs,
  myJobs,
  applyJob,
  createJob,
  updateJob,
  deleteJob
} = require('../controllers/jobcontroller');
const { verifyToken, verifyEmailVerified } = require('../middleware/authmiddleware');
const { adminOnly } = require('../middleware/adminmiddleware');

// Public authenticated user routes
router.get('/', verifyToken, verifyEmailVerified, listJobs);
router.get('/my', verifyToken, verifyEmailVerified, myJobs);
router.post('/apply', verifyToken, verifyEmailVerified, applyJob);

// Admin routes
router.post('/', verifyToken, adminOnly, createJob);
router.put('/:jobId', verifyToken, adminOnly, updateJob);
router.delete('/:jobId', verifyToken, adminOnly, deleteJob);

module.exports = router;
