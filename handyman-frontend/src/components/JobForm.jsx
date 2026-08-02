// src/components/JobForm.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import { CITIES } from "../constants/cities";

function JobForm() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user && user.role !== "client") {
    return (
      <div className="container mx-auto px-4 py-8 max-w-lg text-center">
        <h1 className="text-2xl font-bold text-red-600">
          ⛔ წვდომა აკრძალულია
        </h1>
        <p className="text-gray-600 mt-2">
          მხოლოდ კლიენტებს შეუძლიათ დავალების დამატება.
        </p>
        <Link
          to="/"
          className="text-indigo-600 hover:underline mt-4 inline-block"
        >
          ← უკან
        </Link>
      </div>
    );
  }

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Plumbing",
    district: "",
    address: "",
    budget: "",
    clientName: "",
    clientPhone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/jobs", { ...form, budget: Number(form.budget) });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-lg">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
        ➕ ახალი დავალება
      </h1>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          placeholder="სათაური *"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <textarea
          name="description"
          placeholder="აღწერა *"
          value={form.description}
          onChange={handleChange}
          required
          rows="4"
          className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          {[
            "სანტექნიკა",
            "ელექტრიკა",
            "დურგლობა",
            "შეღებვა",
            "დასუფთავება",
            "მებაღეობა",
            "სხვა",
          ].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          name="district"
          value={form.district}
          onChange={handleChange}
          required
          className="w-full border p-3 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="">აირჩიეთ ქალაქი *</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="address"
          placeholder="ზუსტი მისამართი *"
          value={form.address}
          onChange={handleChange}
          required
          className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <input
          type="number"
          name="budget"
          placeholder="ბიუჯეტი (GEL) *"
          value={form.budget}
          onChange={handleChange}
          required
          className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <input
          type="text"
          name="clientName"
          placeholder="თქვენი სახელი *"
          value={form.clientName}
          onChange={handleChange}
          required
          className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <input
          type="text"
          name="clientPhone"
          placeholder="ტელეფონი *"
          value={form.clientPhone}
          onChange={handleChange}
          required
          className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-sm sm:text-base"
        >
          {loading ? "იტვირთება..." : "📤 დამატება"}
        </button>
      </form>
    </div>
  );
}
export default JobForm;
