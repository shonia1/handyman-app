// controllers/bidController.js
const Bid = require("../models/Bid");
const Job = require("../models/Job");
const Notification = require("../models/Notification");

// @desc    Create a new bid
// @route   POST /api/bids
// @access  Private (craftsman only)
exports.createBid = async (req, res) => {
  try {
    const job = await Job.findById(req.body.job);
    if (!job) {
      return res.status(404).json({ success: false, error: "Job not found" });
    }

    const bidData = { ...req.body, craftsman: req.user.id };
    const bid = await Bid.create(bidData);

    await Notification.create({
      recipient: job.client,
      type: "new_bid",
      message: `ახალი შეთავაზება "${job.title}" - ${bid.offeredPrice} GEL`,
      relatedJob: job._id,
      relatedBid: bid._id,
      data: {
        craftsmanName: bid.craftsmanName,
        offeredPrice: bid.offeredPrice,
      },
    });

    res.status(201).json({ success: true, data: bid });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get all bids for a job
// @route   GET /api/bids/job/:jobId
// @access  Private (job owner or craftsman)
exports.getBidsByJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ success: false, error: "Job not found" });
    }

    const isOwner = job.client.toString() === req.user.id;
    const isCraftsman = req.user.role === "craftsman";
    if (!isOwner && !isCraftsman) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to view bids",
      });
    }

    const bids = await Bid.find({ job: req.params.jobId }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: bids.length,
      data: bids,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Accept or reject a bid (client)
// @route   PATCH /api/bids/:id/status
// @access  Private (job owner)
exports.updateBidStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }

    const bid = await Bid.findById(req.params.id).populate("job");
    if (!bid) return res.status(404).json({ success: false, error: "Bid not found" });

    if (bid.job.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    if (bid.status !== "pending") {
      return res.status(400).json({ success: false, error: "Bid already processed" });
    }

    bid.status = status;
    if (status === "accepted") {
      bid.acceptedAt = new Date();
      bid.job.status = "assigned";
      await bid.job.save();

      await Notification.create({
        recipient: bid.craftsman,
        type: "bid_accepted",
        message: `თქვენი შეთავაზება "${bid.job.title}" მიღებულია! 🎉`,
        relatedJob: bid.job._id,
        relatedBid: bid._id,
        data: {
          clientName: bid.job.clientName,
          clientPhone: bid.job.clientPhone,
          address: bid.job.address,
        },
      });
    } else {
      await Notification.create({
        recipient: bid.craftsman,
        type: "bid_rejected",
        message: `თქვენი შეთავაზება "${bid.job.title}" უარყოფილია.`,
        relatedJob: bid.job._id,
        relatedBid: bid._id,
      });
    }

    await bid.save();
    res.status(200).json({ success: true, data: bid });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Craftsman confirms the job (skip timer)
// @route   POST /api/bids/:id/confirm
// @access  Private (craftsman who owns the bid)
exports.confirmBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id).populate("job");
    if (!bid) {
      return res.status(404).json({ success: false, error: "Bid not found" });
    }

    if (bid.craftsman.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    if (bid.status !== "accepted_pending") {
      return res.status(400).json({ success: false, error: "Bid is not in pending confirmation state" });
    }

    // Confirm: change to accepted
    bid.status = "accepted";
    await bid.save();

    // Optionally send notification to client
    await Notification.create({
      recipient: bid.job.client,
      type: "bid_confirmed",
      message: `ხელოსანმა ${req.user.name} დაადასტურა დავალება "${bid.job.title}"`,
      relatedJob: bid.job._id,
      relatedBid: bid._id,
    });

    res.status(200).json({ success: true, data: bid });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Cancel an accepted_pending bid (within 5 minutes)
// @route   POST /api/bids/:id/cancel
// @access  Private (craftsman who owns the bid)
exports.cancelAcceptedBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id).populate("job");
    if (!bid) {
      return res.status(404).json({ success: false, error: "Bid not found" });
    }

    if (bid.craftsman.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    if (bid.status !== "accepted_pending") {
      return res.status(400).json({ success: false, error: "Only pending confirmation bids can be cancelled" });
    }

    const now = new Date();
    const diff = now - bid.acceptedAt;
    if (diff > 300000) {
      return res.status(400).json({
        success: false,
        error: "5 წუთი გავიდა, გაუქმება შეუძლებელია",
      });
    }

    // Cancel: delete bid and revert job status
    await bid.deleteOne();
    const job = await Job.findById(bid.job._id);
    if (job && job.status === "assigned") {
      job.status = "open";
      await job.save();
    }

    await Notification.create({
      recipient: job.client,
      type: "bid_cancelled",
      message: `ხელოსანმა ${req.user.name} გააუქმა შეთავაზება "${job.title}"`,
      relatedJob: job._id,
    });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};