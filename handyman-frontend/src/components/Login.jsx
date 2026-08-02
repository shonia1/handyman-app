// src/components/Login.jsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// 🔥 თუ გსურთ დაბლოკილი მომხმარებლებისთვის კონტაქტის მიწოდება, ჩაწერეთ ეს მნიშვნელობები
const ADMIN_CONTACT = {
  email: "dito@gmail.com", // თქვენი ადმინის მეილი
  telegram: "https://t.me/your_telegram_bot_username", // თუ გსურთ ტელეგრამის ბმული
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      const errorMsg = err.response?.data?.error || "ავტორიზაცია ვერ მოხერხდა. შეამოწმეთ მონაცემები.";
      
      // 🔥 თუ შეცდომაა და ის დაბლოკვაზე მიუთითებს
      if (err.response?.data?.isBanned || errorMsg.includes("banned") || errorMsg.includes("Account is banned")) {
        setError(
          <div className="space-y-2">
            <p className="font-bold text-red-700">🚫 ანგარიში დაბლოკილია!</p>
            <p>თქვენი ანგარიში ადმინისტრატორის მიერ დაბლოკილია. შეტყობინებისთვის, გთხოვთ, დაუკავშირდით ადმინისტრატორს:</p>
            <div className="mt-2 flex flex-col gap-2 text-center">
              <a href={`mailto:${ADMIN_CONTACT.email}`} className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition">
                📧 მოგვწერეთ მეილი: {ADMIN_CONTACT.email}
              </a>
              {ADMIN_CONTACT.telegram && (
                <a href={ADMIN_CONTACT.telegram} target="_blank" rel="noopener noreferrer" className="inline-block bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-200 transition">
                  💬 მოგვწერეთ Telegram-ზე
                </a>
              )}
            </div>
          </div>
        );
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">შესვლა</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">ელ-ფოსტა</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="თქვენი ელ-ფოსტა" />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">პაროლი</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="თქვენი პაროლი" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed">{loading ? "იტვირთება..." : "შესვლა"}</button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          არ გაქვთ ანგარიში?{" "}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">რეგისტრაცია</Link>
        </div>
      </div>
    </div>
  );
};
export default Login;