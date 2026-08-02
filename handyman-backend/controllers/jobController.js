// controllers/jobController.js
const Job = require("../models/Job");
const User = require("../models/User");
const Bid = require("../models/Bid");
const Notification = require("../models/Notification");
const jwt = require("jsonwebtoken");
const bot = require("../config/telegram");

// ──────────────────────────────────────────────────────
// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private (client only)
// ──────────────────────────────────────────────────────
exports.createJob = async (req, res) => {
  try {
    const jobData = { ...req.body, client: req.user.id };
    const job = await Job.create(jobData);
    console.log("✅ Job created with ID:", job._id);

    // Non‑blocking Telegram notifications
    setImmediate(async () => {
      try {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        if (!token) return;

        const craftsmen = await User.find({
          role: "craftsman",
          profession: { $in: [job.category] },
          cities: { $in: [job.district] },
          telegramChatId: { $ne: null },
        });

        if (craftsmen.length === 0) {
          console.log(`ℹ️ No craftsmen for ${job.category} in ${job.district}`);
          return;
        }

        const message = `
🔨 *New Job Posted!*
📌 *Title:* ${job.title}
📂 *Category:* ${job.category}
📍 *District:* ${job.district}
💰 *Budget:* ${job.budget} GEL
👤 *Client:* ${job.clientName}
📞 *Phone:* ${job.clientPhone}
📝 *Description:* ${job.description.substring(0, 200)}${job.description.length > 200 ? "..." : ""}
📅 *Posted:* ${new Date(job.createdAt).toLocaleString()}
        `;

        await Promise.allSettled(
          craftsmen.map((c) =>
            bot.telegram
              .sendMessage(c.telegramChatId, message, {
                parse_mode: "Markdown",
              })
              .then(() => console.log(`✅ Telegram sent to ${c.name}`))
              .catch((err) =>
                console.error(`❌ Failed to send to ${c.name}:`, err.message),
              ),
          ),
        );
        console.log(`✅ Telegram done for job ${job._id}`);
      } catch (err) {
        console.error("❌ Telegram error:", err.message);
      }
    });

    res.status(201).json({ success: true, data: job });
  } catch (error) {
    console.error("❌ Error creating job:", error.message);
    res.status(400).json({ success: false, error: error.message });
  }
};

// ──────────────────────────────────────────────────────
// @desc    Get all jobs with pagination, search & filter
// @route   GET /api/jobs?page=1&limit=6&search=...&category=...&myJobs=true&showArchived=false&city=...
// @access  Public
// ──────────────────────────────────────────────────────
exports.getJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const search = req.query.search || "";
    const category = req.query.category || "";
    const myJobs = req.query.myJobs === "true";
    const showArchived = req.query.showArchived === "true";
    const cityFilter = req.query.city || "";

    const filter = {};
    if (category) filter.category = category;
    if (search) filter.title = { $regex: search, $options: "i" };
    if (cityFilter) filter.district = cityFilter;

    // 🔥 არქივის ფილტრი – სწორი ლოგიკა
    if (showArchived) {
      // თუ არქივი ჩართულია – ვაჩვენოთ მხოლოდ დასრულებული/გაუქმებული
      filter.status = { $in: ["completed", "cancelled"] };
    } else {
      // თუ არქივი გამორთულია – არ ვაჩვენოთ დასრულებული/გაუქმებული
      filter.status = { $nin: ["completed", "cancelled"] };
    }

    // Optional authentication (for craftsman profession filtering)
    let user = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findById(decoded.id);
      } catch (err) {}
    }

    if (user && user.role === "craftsman") {
      if (user.profession && user.profession.length > 0) {
        filter.category = { $in: user.profession };
      } else {
        filter.category = { $in: [] };
      }
    }

    if (user && user.role === "client" && myJobs) {
      filter.client = user.id;
    }

    const skip = (page - 1) * limit;
    const [jobs, total] = await Promise.all([
      Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Job.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / limit);
    res.status(200).json({
      success: true,
      data: jobs,
      pagination: { page, limit, total, pages },
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ──────────────────────────────────────────────────────
// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
// ──────────────────────────────────────────────────────
exports.getJob = async (req, res) => {
  try {
    let user = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findById(decoded.id).select("-password");
      } catch (err) {}
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, error: "Job not found" });
    }

    // Auto‑upgrade accepted_pending to accepted after 5 minutes
    if (user && user.role === "craftsman") {
      const pendingBid = await Bid.findOne({
        job: job._id,
        craftsman: user.id,
        status: "accepted_pending",
      });
      if (pendingBid) {
        const now = new Date();
        const diff = now - pendingBid.acceptedAt;
        if (diff >= 300000) {
          pendingBid.status = "accepted";
          await pendingBid.save();
        }
      }
    }

    const jobData = job.toObject();
    const isOwner = user && user.id === job.client.toString();

    let isAcceptedCraftsman = false;
    if (user && user.role === "craftsman") {
      const acceptedBid = await Bid.findOne({
        job: job._id,
        craftsman: user.id,
        status: "accepted",
      });
      if (acceptedBid) isAcceptedCraftsman = true;
    }

    if (!isOwner && !isAcceptedCraftsman) {
      delete jobData.clientName;
      delete jobData.clientPhone;
      delete jobData.address;
    }

    res.status(200).json({ success: true, data: jobData });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res
        .status(404)
        .json({ success: false, error: "Invalid job ID format" });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

// ──────────────────────────────────────────────────────
// @desc    Update job status
// @route   PATCH /api/jobs/:id
// @access  Private (only job owner)
// ──────────────────────────────────────────────────────
exports.updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (
      !status ||
      !["open", "assigned", "completed", "cancelled"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Allowed: open, assigned, completed, cancelled",
      });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, error: "Job not found" });
    }

    if (job.client.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this job status",
      });
    }

    job.status = status;
    await job.save();

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res
        .status(404)
        .json({ success: false, error: "Invalid job ID format" });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

// ──────────────────────────────────────────────────────
// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (only job owner)
// ──────────────────────────────────────────────────────
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, error: "Job not found" });
    }

    if (job.client.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this job",
      });
    }

    await Bid.deleteMany({ job: job._id });
    await job.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res
        .status(404)
        .json({ success: false, error: "Invalid job ID format" });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

// ──────────────────────────────────────────────────────
// @desc    Craftsman accepts a job directly
// @route   POST /api/jobs/:id/accept
// @access  Private (craftsman only)
// ──────────────────────────────────────────────────────
exports.acceptJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, error: "Job not found" });
    }

    if (job.status !== "open") {
      return res.status(400).json({ success: false, error: "Job is not open" });
    }

    if (req.user.role !== "craftsman") {
      return res
        .status(403)
        .json({ success: false, error: "Only craftsmen can accept jobs" });
    }

    if (!req.user.profession || !req.user.profession.includes(job.category)) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Your profession does not match this job category",
        });
    }

    const existingAccepted = await Bid.findOne({
      job: job._id,
      status: { $in: ["accepted", "accepted_pending"] },
    });
    if (existingAccepted) {
      return res
        .status(400)
        .json({ success: false, error: "This job is already assigned" });
    }

    const bid = await Bid.create({
      job: job._id,
      craftsman: req.user.id,
      craftsmanName: req.user.name,
      craftsmanPhone: req.user.phone,
      offeredPrice: job.budget,
      message: "Accepted job directly",
      status: "accepted_pending",
      acceptedAt: new Date(),
    });

    job.status = "assigned";
    await job.save();

    await Notification.create({
      recipient: job.client,
      type: "bid_accepted",
      message: `ხელოსანი ${req.user.name} დათანხმდა თქვენს დავალებას "${job.title}"`,
      relatedJob: job._id,
      relatedBid: bid._id,
      data: {
        craftsmanName: req.user.name,
        craftsmanPhone: req.user.phone,
      },
    });

    res.status(200).json({ success: true, data: { job, bid } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
