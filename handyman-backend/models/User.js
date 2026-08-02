// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false, minlength: 6 },
    phone: { type: String, required: true },
    role: { type: String, enum: ["client", "craftsman"], default: "client" },
    profession: { type: [String], default: [] },
    cities: { type: [String], default: [] },
    telegramChatId: { type: String, default: null },
    isBanned: { type: Boolean, default: false },
    banReason: { type: String, default: null },
    bannedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// 🔥 მეთოდი პაროლის შემოწმებისთვის
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
