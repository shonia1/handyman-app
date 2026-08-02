// models/Bid.js
const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    craftsmanName: {
      type: String,
      required: true,
    },
    craftsmanPhone: {
      type: String,
      required: true,
    },
    offeredPrice: {
      type: Number,
      required: true,
      min: [1, "Price must be at least 1 GEL"],
    },
    message: {
      type: String,
      required: false,
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "accepted_pending", "accepted", "rejected"],
      default: "pending",
    },
    craftsman: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Bid", bidSchema);