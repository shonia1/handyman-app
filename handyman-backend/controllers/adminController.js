const User = require("../models/User");
const Job = require("../models/Job");
const Bid = require("../models/Bid");

// სტატისტიკის მიღება
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const clients = await User.countDocuments({ role: "client" });
    const craftsmen = await User.countDocuments({ role: "craftsman" });
    const activeJobs = await Job.countDocuments({ status: { $nin: ["completed", "cancelled"] } });
    const completedJobs = await Job.countDocuments({ status: "completed" });

    res.json({
      totalUsers, clients, craftsmen, activeJobs, completedJobs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ყველა მომხმარებლის სია (პაროლის გარეშე)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// მომხმარებლის დაბლოკვა/ბანი
exports.banUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { banReason } = req.body;
    const user = await User.findByIdAndUpdate(id, {
      isBanned: true,
      banReason,
      bannedAt: new Date(),
    }, { new: true }).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ბანის მოხსნა
exports.unbanUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, {
      isBanned: false,
      banReason: null,
      bannedAt: null,
    }, { new: true }).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// მომხმარებლის წაშლა (და მისი ბიდების/შეკვეთების გასუფთავება)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await Bid.deleteMany({ craftsman: id });
    await Bid.deleteMany({ craftsman: id });
    const jobs = await Job.find({ client: id });
    for (const job of jobs) {
      await Bid.deleteMany({ job: job._id });
      await job.deleteOne();
    }
    await User.findByIdAndDelete(id);
    res.json({ success: true, message: "მომხმარებელი და მისი შეკვეთები წაშლილია" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ყველა შეკვეთის მიღება (ადმინისთვის)
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate("client", "name email").sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// შეკვეთის წაშლა
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    await Bid.deleteMany({ job: id });
    await Job.findByIdAndDelete(id);
    res.json({ success: true, message: "შეკვეთა წაშლილია" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ⚠️ სარისკო: მთელი ბაზის გასუფთავება
exports.cleanupEverything = async (req, res) => {
  try {
    const { confirmKey } = req.body;
    if (confirmKey !== "DELETE_ALL") {
      return res.status(400).json({ error: "არასწორი დადასტურების კოდი" });
    }
    // გარდა თავად ადმინისა
    const adminUser = await User.findOne({ role: "admin" });
    await User.deleteMany({ _id: { $ne: adminUser?._id } });
    await Job.deleteMany({});
    await Bid.deleteMany({});
    res.json({ success: true, message: "მთელი ბაზა გასუფთავდა (ადმინის გარდა)" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};