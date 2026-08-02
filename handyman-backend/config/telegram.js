// config/telegram.js
const { Telegraf } = require("telegraf");
const User = require("../models/User");

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("❌ TELEGRAM_BOT_TOKEN is missing in .env");
} else {
  console.log("✅ Telegram bot token found");
}

const bot = new Telegraf(token);

// ─── /start command with payload ───
bot.start(async (ctx) => {
  const chatId = ctx.chat.id;
  const payload = ctx.startPayload;
  console.log("📩 /start received. chatId:", chatId, "payload:", payload);

  try {
    if (payload && payload.startsWith("userId=")) {
      const userId = payload.split("=")[1];
      console.log("🔍 Looking for user with ID:", userId);

      // 🔥 Find user
      const user = await User.findById(userId);
      if (!user) {
        console.log("❌ User not found with ID:", userId);
        return ctx.reply("❌ მომხმარებელი არ მოიძებნა. გთხოვთ, დარეგისტრირდით აპლიკაციაში.");
      }

      console.log("✅ User found:", user.email, "Role:", user.role);

      // 🔥 Update telegramChatId WITHOUT triggering pre-save hooks
      await User.updateOne(
        { _id: user._id },
        { telegramChatId: chatId.toString() }
      );

      console.log("✅ telegramChatId updated for user:", user.email);

      return ctx.reply(
        `✅ Telegram ანგარიში წარმატებით დაუკავშირდა თქვენს ანგარიშს (${user.email})!\n\n` +
        `🔔 ახლა თქვენ მიიღებთ შეტყობინებებს ახალი დავალებების შესახებ (${user.profession.join(", ")}).`
      );
    }

    await ctx.reply(
      `👋 გამარჯობა! \n\n` +
      `თუ გსურთ დააკავშიროთ Telegram ანგარიში, გთხოვთ, დააჭირეთ ლინკს, რომელიც მოგეცათ აპლიკაციაში რეგისტრაციისას.\n\n` +
      `თუ ლინკი არ გაქვთ, გთხოვთ, დაბრუნდით აპლიკაციაში და ხელახლა მიიღეთ ლინკი.`
    );
  } catch (error) {
    console.error("❌ Error in /start handler:", error);
    console.error("   Stack:", error.stack);
    await ctx.reply(
      "❌ მოხდა შეცდომა ანგარიშის დაკავშირებისას. გთხოვთ, სცადეთ მოგვიანებით ან დაგვიკავშირდით ადმინისტრატორს.\n\n" +
      "⚠️ შეცდომის დეტალები: " + error.message
    );
  }
});

// ─── Global error handler ───
bot.catch((err, ctx) => {
  console.error("⚠️ Telegram bot global error:", err.message);
  console.error("   Stack:", err.stack);
});

module.exports = bot;