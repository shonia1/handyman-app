const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const bot = require("./config/telegram");

const jobRoutes = require("./routes/jobRoutes");
const bidRoutes = require("./routes/bidRoutes");
const authRoutes = require("./routes/authRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const questionRoutes = require("./routes/questionRoutes");
const sitemapRoutes = require("./routes/sitemapRoutes");
const adminRoutes = require("./routes/adminRoutes"); // 🔥 დაამატეთ

const app = express();
connectDB();

if (process.env.TELEGRAM_BOT_TOKEN) {
  bot.launch().then(() => console.log("✅ Telegram bot is running")).catch(err => console.error(err));
}

const corsOptions = {
  origin: [
    "https://handyman-ge.vercel.app",
    "http://localhost:5173",
    "https://handyman-marketplace.vercel.app"
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

app.use("/", sitemapRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/admin", adminRoutes); // 🔥 მარშრუტის რეგისტრაცია

app.get("/api/health", (req, res) => res.status(200).json({ status: "OK" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));

process.once("SIGINT", () => { bot.stop("SIGINT"); process.exit(0); });
process.once("SIGTERM", () => { bot.stop("SIGTERM"); process.exit(0); });