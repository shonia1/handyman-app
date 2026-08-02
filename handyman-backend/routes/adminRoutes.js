// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");

// მიდლვერი როლის შესამოწმებლად
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ error: "წვდომა აკრძალულია. მხოლოდ ადმინისთვის." });
  }
};

// ყველა მარშრუტი დაცულია protect + adminOnly-თი
router.use(protect, adminOnly);

router.get("/stats", adminController.getStats);
router.get("/users", adminController.getAllUsers);
router.patch("/users/:id/ban", adminController.banUser);
router.patch("/users/:id/unban", adminController.unbanUser);
router.delete("/users/:id", adminController.deleteUser);
router.get("/jobs", adminController.getAllJobs);
router.delete("/jobs/:id", adminController.deleteJob);
router.post("/cleanup", adminController.cleanupEverything);

module.exports = router;