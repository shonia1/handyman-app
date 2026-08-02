// src/components/TelegramBanner.jsx
import { useAuth } from "../hooks/useAuth";

const TelegramBanner = () => {
  const { user } = useAuth();
  if (!user || user.role !== "craftsman" || user.telegramChatId) return null;

  const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || "YourBotUsername";
  const link = `https://t.me/${botUsername}?start=userId=${user.id}`;

  return (
    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 sm:p-4 rounded-xl shadow-lg mb-4 sm:mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-2xl sm:text-3xl">📱</span>
        <div>
          <p className="font-semibold text-sm sm:text-base">გსურთ ახალი დავალებები მიიღოთ ტელეგრამით?</p>
          <p className="text-xs sm:text-sm text-blue-100">მიიღეთ შეტყობინებები პირდაპირ Telegram-ზე.</p>
        </div>
      </div>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-white text-indigo-700 hover:bg-gray-100 font-semibold px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg transition shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap text-sm sm:text-base w-full sm:w-auto justify-center"
      >
        <span>🔗</span> დაკავშირება
      </a>
    </div>
  );
};
export default TelegramBanner;