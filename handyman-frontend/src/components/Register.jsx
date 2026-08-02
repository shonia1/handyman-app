// src/components/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';
import { CITIES } from "../constants/cities";

const PROFESSIONS = ["Plumbing", "Electrical", "Carpentry", "Painting", "Cleaning", "Gardening", "Other"];

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", role: "client",
    profession: [], cities: [],
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleProfessionToggle = (p) => {
    setForm(prev => ({
      ...prev,
      profession: prev.profession.includes(p) ? prev.profession.filter(x => x !== p) : [...prev.profession, p]
    }));
  };
  const handleCityToggle = (c) => {
    setForm(prev => ({
      ...prev,
      cities: prev.cities.includes(c) ? prev.cities.filter(x => x !== c) : [...prev.cities, c]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (form.role === "craftsman") {
      if (form.profession.length === 0) return setError("აირჩიეთ პროფესია");
      if (form.cities.length === 0) return setError("აირჩიეთ ქალაქი");
    }
    try {
      const payload = { ...form };
      if (form.role === "client") { payload.profession = []; payload.cities = []; }
      const response = await register(payload);
      setRegisteredUser(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setLoading(false);
    }
  };

  if (registeredUser?.role === "craftsman") {
    const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || "YourBotUsername";
    return (
      <div className="container mx-auto px-4 py-8 max-w-md text-center">
        <h1 className="text-2xl font-bold text-green-600">✅ რეგისტრაცია წარმატებულია!</h1>
        <p className="text-gray-700 my-4">თქვენ დარეგისტრირდით როგორც <strong>ხელოსანი</strong>.</p>
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-700 mb-3">📱 <strong>Telegram-თან დასაკავშირებლად</strong> დააჭირეთ:</p>
          <a
            href={`https://t.me/${botUsername}?start=userId=${registeredUser.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition w-full sm:w-auto"
          >
            🔗 Telegram-თან დაკავშირება
          </a>
          <p className="text-xs text-gray-400 mt-2">(დააჭირეთ "Start" ბოტში)</p>
        </div>
        <button
          onClick={() => navigate("/")}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition"
        >
          დაშზე გადასვლა
        </button>
      </div>
    );
  }
  if (registeredUser?.role === "client") { navigate("/"); return null; }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-md">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">📝 რეგისტრაცია</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="სახელი *"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <input
          type="email"
          name="email"
          placeholder="Email *"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <input
          type="password"
          name="password"
          placeholder="პაროლი (მინ. 6)"
          value={form.password}
          onChange={handleChange}
          required
          minLength="6"
          className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <input
          type="text"
          name="phone"
          placeholder="ტელეფონი *"
          value={form.phone}
          onChange={handleChange}
          required
          className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="client">კლიენტი</option>
          <option value="craftsman">ხელოსანი</option>
        </select>

        {form.role === "craftsman" && (
          <>
            <div className="border p-4 rounded-lg bg-gray-50">
              <p className="font-semibold text-gray-700 mb-3 text-sm">აირჩიეთ პროფესიები *</p>
              <div className="grid grid-cols-2 gap-2">
                {PROFESSIONS.map(p => (
                  <label key={p} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={form.profession.includes(p)}
                      onChange={() => handleProfessionToggle(p)}
                      className="w-4 h-4 text-indigo-600"
                    />
                    {p}
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {form.profession.length > 0 ? `არჩეულია: ${form.profession.join(", ")}` : "აირჩიეთ მინიმუმ ერთი"}
              </p>
            </div>
            <div className="border p-4 rounded-lg bg-gray-50">
              <p className="font-semibold text-gray-700 mb-3 text-sm">აირჩიეთ ქალაქები *</p>
              <div className="grid grid-cols-2 gap-2">
                {CITIES.map(c => (
                  <label key={c} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={form.cities.includes(c)}
                      onChange={() => handleCityToggle(c)}
                      className="w-4 h-4 text-indigo-600"
                    />
                    {c}
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {form.cities.length > 0 ? `არჩეულია: ${form.cities.join(", ")}` : "აირჩიეთ მინიმუმ ერთი"}
              </p>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50 text-sm sm:text-base"
        >
          {loading ? "იტვირთება..." : "რეგისტრაცია"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        უკვე გაქვთ ანგარიში? <Link to="/login" className="text-indigo-600 hover:underline">შესვლა</Link>
      </p>
    </div>
  );
}
export default Register;