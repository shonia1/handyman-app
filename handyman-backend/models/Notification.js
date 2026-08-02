// models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["new_bid", "bid_accepted", "bid_rejected", "bid_cancelled", "bid_confirmed"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    relatedJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
    relatedBid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bid",
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);