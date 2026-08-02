// models/Job.js
const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a job title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
      maxlength: [2000, "Description cannot be more than 2000 characters"],
    },
    category: {
      type: String,
      required: [true, "Please specify a category"],
      // models/Job.js
      enum: [
        "სანტექნიკა",
        "ელექტრიკა",
        "დურგლობა",
        "შეღებვა",
        "დასუფთავება",
        "მებაღეობა",
        "სხვა",
      ],
    },
    district: {
      type: String,
      required: [true, "Please specify a district"],
    },
    address: {
      type: String,
      required: [
        true,
        "Please add a complete address (street, house, apartment)",
      ],
    },
    budget: {
      type: Number,
      required: [true, "Please specify a budget"],
      min: [1, "Budget must be at least 1 GEL"],
    },
    photos: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["open", "assigned", "completed", "cancelled"],
      default: "open",
    },
    clientName: {
      type: String,
      required: [true, "Please add your name"],
    },
    clientPhone: {
      type: String,
      required: [true, "Please add a phone number"],
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Job", jobSchema);
