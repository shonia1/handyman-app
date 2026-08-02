// server.js
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const bot = require("./config/telegram"); // Import bot

const jobRoutes = require("./routes/jobRoutes");
const bidRoutes = require("./routes/bidRoutes");
const authRoutes = require("./routes/authRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const questionRoutes = require("./routes/questionRoutes");
const sitemapRoutes = require("./routes/sitemapRoutes");

// 1. ჯერ ვქმნით app-ს!
const app = express();

// Connect to MongoDB
connectDB();

// ─── Telegram bot launch ───
if (process.env.TELEGRAM_BOT_TOKEN) {
  bot
    .launch()
    .then(() => {
      console.log("✅ Telegram bot is running (polling mode)");
    })
    .catch((err) => {
      console.error("❌ Failed to launch Telegram bot:", err.message);
    });
} else {
  console.warn("⚠️ TELEGRAM_BOT_TOKEN not set. Bot not launched.");
}

// ─── Middlewares ───
// 🔥 გავასწოროთ CORS, რათა ზუსტად მიუთითოს თქვენი ფრონტენდის მისამართი
const corsOptions = {
  origin: [
    "https://handyman-ge.vercel.app", // თქვენი ახალი Vercel მისამართი
    "http://localhost:5173", // ლოკალური დეველოპმენტის მისამართი
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());

// ─── Routes ───
app.use("/", sitemapRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/questions", questionRoutes);

// ─── Health check ───
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// ─── Start server ───
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ─── Graceful shutdown ───
process.once("SIGINT", () => {
  bot.stop("SIGINT");
  process.exit(0);
});
process.once("SIGTERM", () => {
  bot.stop("SIGTERM");
  process.exit(0);
});
