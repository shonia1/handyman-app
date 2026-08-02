const User = require("../models/User");
const Job = require("../models/Job");
const Bid = require("../models/Bid");

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const clients = await User.countDocuments({ role: "client" });
    const craftsmen = await User.countDocuments({ role: "craftsman" });
    const activeJobs = await Job.countDocuments({ status: { $nin: ["completed", "cancelled"] } });
    const completedJobs = await Job.countDocuments({ status: "completed" });
    res.json({ totalUsers, clients, craftsmen, activeJobs, completedJobs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.banUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: true, banReason: req.body.banReason, bannedAt: new Date() },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.unbanUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: false, banReason: null, bannedAt: null },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await Bid.deleteMany({ craftsman: req.params.id });
    const jobs = await Job.find({ client: req.params.id });
    for (const job of jobs) {
      await Bid.deleteMany({ job: job._id });
      await job.deleteOne();
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "მომხმარებელი და მისი შეკვეთები წაშლილია" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate("client", "name email").sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    await Bid.deleteMany({ job: req.params.id });
    await Job.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "შეკვეთა წაშლილია" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cleanupEverything = async (req, res) => {
  try {
    if (req.body.confirmKey !== "DELETE_ALL") {
      return res.status(400).json({ error: "არასწორი კოდი" });
    }
    const adminUser = await User.findOne({ role: "admin" });
    await User.deleteMany({ _id: { $ne: adminUser?._id } });
    await Job.deleteMany({});
    await Bid.deleteMany({});
    res.json({ success: true, message: "მთელი ბაზა გასუფთავდა (ადმინის გარდა)" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};