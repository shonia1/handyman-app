// routes/jobRoutes.js
const express = require('express');
const {
  createJob,
  getJobs,
  getJob,
  updateJobStatus,
  deleteJob,
  acceptJob,
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getJobs)
  .post(protect, authorize('client'), createJob);

router.route('/:id')
  .get(getJob)
  .patch(protect, updateJobStatus)
  .delete(protect, deleteJob);

// 🔥 Craftsman accepts job
router.route('/:id/accept')
  .post(protect, authorize('craftsman'), acceptJob);

module.exports = router;