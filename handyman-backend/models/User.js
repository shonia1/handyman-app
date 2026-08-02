const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, enum: ["client", "craftsman", "admin"], default: "client" },
    profession: { type: [String], default: [] },
    cities: { type: [String], default: [] },
    telegramChatId: { type: String, default: null },
    isBanned: { type: Boolean, default: false },
    banReason: { type: String, default: null },
    bannedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);