// models/Question.js
const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: [500, "Question cannot exceed 500 characters"],
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "answered"],
      default: "pending",
    },
    editedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

questionSchema.index({ job: 1, createdAt: -1 });

module.exports = mongoose.model("Question", questionSchema);