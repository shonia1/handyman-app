// controllers/adminController.js
const User = require("../models/User");
const Job = require("../models/Job");

// 1. სტატისტიკა
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const clients = await User.countDocuments({ role: "client" });
    const craftsmen = await User.countDocuments({ role: "craftsman" });
    const activeJobs = await Job.countDocuments({ status: "open" });
    const completedJobs = await Job.countDocuments({ status: "completed" });
    res.json({ totalUsers, clients, craftsmen, activeJobs, completedJobs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. ყველა მომხმარებელი (✅ პაროლის დასაბრუნებლად შეცვლილია +password)
exports.getAllUsers = async (req, res) => {
  try {
    // მოვაშორეთ '-password' და დავამატეთ '+password', რომ ბექენდმა პაროლიც დააბრუნოს
    const users = await User.find().select('+password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. მომხმარებლის ბანი
exports.banUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "მომხმარებელი არ მოიძებნა" });
    if (user.role === "admin") return res.status(403).json({ error: "ადმინის დაბლოკვა შეუძლებელია" });

    user.isBanned = true;
    user.banReason = req.body.banReason || "დარღვევა";
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. ბანის მოხსნა
exports.unbanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "მომხმარებელი არ მოიძებნა" });
    user.isBanned = false;
    user.banReason = null;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. მომხმარებლის წაშლა (ადმინი)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "მომხმარებელი არ მოიძებნა" });
    if (user.role === "admin") return res.status(403).json({ error: "ადმინის წაშლა შეუძლებელია" });

    // წავშალოთ მომხმარებლის ყველა განცხადებაც
    await Job.deleteMany({ client: user._id });
    await user.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 6. ყველა დავალება
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate("client", "name email");
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 7. დავალების წაშლა
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: "დავალება არ მოიძებნა" });
    await job.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 8. ბაზის სრული გასუფთავება (ადმინი)
exports.cleanupEverything = async (req, res) => {
  if (req.body.confirmKey !== "DELETE_ALL") {
    return res.status(400).json({ error: "არასწორი გასაღები" });
  }
  try {
    await User.deleteMany({ role: { $ne: "admin" } });
    await Job.deleteMany({});
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};