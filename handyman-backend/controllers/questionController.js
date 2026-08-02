// controllers/questionController.js
const Question = require("../models/Question");
const Job = require("../models/Job");

// @desc    Get all questions for a job (including replies)
// @route   GET /api/questions/job/:jobId
// @access  Public
exports.getQuestionsByJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ success: false, error: "Job not found" });
    }

    const questions = await Question.find({ job: req.params.jobId })
      .sort({ createdAt: 1 })
      .populate("author", "name role")
      .lean();

    // Build thread structure
    const map = {};
    const roots = [];
    questions.forEach((q) => {
      map[q._id] = { ...q, replies: [] };
    });
    questions.forEach((q) => {
      if (q.parent && map[q.parent]) {
        map[q.parent].replies.push(map[q._id]);
      } else {
        roots.push(map[q._id]);
      }
    });

    const pendingCount = await Question.countDocuments({
      job: req.params.jobId,
      status: "pending",
      parent: null,
    });

    res.status(200).json({
      success: true,
      data: roots,
      meta: { pendingCount },
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Create a new question
// @route   POST /api/questions
// @access  Private
exports.createQuestion = async (req, res) => {
  try {
    const { job, text } = req.body;
    if (!text) {
      return res
        .status(400)
        .json({ success: false, error: "Please provide text" });
    }

    const jobExists = await Job.findById(job);
    if (!jobExists) {
      return res.status(404).json({ success: false, error: "Job not found" });
    }

    // Craftsman limit: max 3 pending questions per job
    if (req.user.role === "craftsman") {
      const pendingCount = await Question.countDocuments({
        job,
        author: req.user.id,
        status: "pending",
        parent: null,
      });

      if (pendingCount >= 3) {
        return res.status(400).json({
          success: false,
          error:
            "თქვენ გაქვთ 3 დაუსრულებელი კითხვა. გთხოვთ, დაელოდოთ კლიენტის პასუხს.",
        });
      }
    }

    const question = await Question.create({
      job,
      author: req.user.id,
      authorName: req.user.name,
      text,
      status: "pending",
    });

    res.status(201).json({ success: true, data: question });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Reply to a question (only client can answer top-level)
// @route   POST /api/questions/:id/reply
// @access  Private
exports.replyToQuestion = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res
        .status(400)
        .json({ success: false, error: "Please provide text" });
    }

    const parent = await Question.findById(req.params.id);
    if (!parent) {
      return res
        .status(404)
        .json({ success: false, error: "Parent question not found" });
    }

    const job = await Job.findById(parent.job);
    if (!job) {
      return res.status(404).json({ success: false, error: "Job not found" });
    }

    // Only job owner (client) can answer top-level questions
    const isTopLevel = parent.parent === null;
    let newStatus = "pending";

    if (isTopLevel) {
      if (job.client.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: "მხოლოდ კლიენტს შეუძლია კითხვაზე პასუხის გაცემა",
        });
      }
      newStatus = "answered";
    }

    const reply = await Question.create({
      job: parent.job,
      author: req.user.id,
      authorName: req.user.name,
      text,
      parent: parent._id,
      status: newStatus,
    });

    if (isTopLevel && job.client.toString() === req.user.id) {
      parent.status = "answered";
      await parent.save();
    }

    res.status(201).json({ success: true, data: reply });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/// @desc    Edit a question or reply
// @route   PATCH /api/questions/:id
// @access  Private (only author)
exports.editQuestion = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res
        .status(400)
        .json({ success: false, error: "Please provide text" });
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res
        .status(404)
        .json({ success: false, error: "Question not found" });
    }

    if (question.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to edit this question",
      });
    }

    // If it's a top-level question, only allow if pending
    if (!question.parent && question.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: "Cannot edit a question that has been answered",
      });
    }

    // If it's a reply (has parent), allow editing regardless of status
    // (but we can keep the same rule if we want – but we allow it)

    question.text = text;
    question.editedAt = new Date();
    await question.save();

    res.status(200).json({ success: true, data: question });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
