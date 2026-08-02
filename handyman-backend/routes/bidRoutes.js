// routes/bidRoutes.js
const express = require("express");
const {
  createBid,
  getBidsByJob,
  updateBidStatus,
  cancelAcceptedBid,
  confirmBid, // NEW
} = require("../controllers/bidController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.route("/")
  .post(protect, authorize("craftsman"), createBid);

router.route("/job/:jobId")
  .get(protect, getBidsByJob);

router.route("/:id/status")
  .patch(protect, updateBidStatus);

router.route("/:id/cancel")
  .post(protect, authorize("craftsman"), cancelAcceptedBid);

router.route("/:id/confirm")
  .post(protect, authorize("craftsman"), confirmBid);

module.exports = router;