// routes/questionRoutes.js
const express = require("express");
const {
  getQuestionsByJob,
  createQuestion,
  replyToQuestion,
  editQuestion,
} = require("../controllers/questionController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.route("/job/:jobId").get(getQuestionsByJob);
router.route("/").post(protect, createQuestion);
router.route("/:id/reply").post(protect, replyToQuestion);
router.route("/:id").patch(protect, editQuestion);

module.exports = router;