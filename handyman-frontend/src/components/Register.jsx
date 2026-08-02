// src/components/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client"); // როლის ცვლადი
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register({ 
        name, 
        email, 
        password, 
        role 
      });
      
      navigate("/", { replace: true });
    } catch (err) {
      console.error("სრული შეცდომა:", err);
      console.error("ბექენდის პასუხი:", err.response?.data);
      
      const serverMessage = err.response?.data?.message || err.response?.data?.error;
      const fallbackMessage = "რეგისტრაცია ვერ მოხერხდა. სცადეთ თავიდან.";
      setError(serverMessage || fallbackMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          რეგისტრაცია
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              სახელი / მომხმარებელი
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="შეიყვანეთ თქვენი სახელი"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              ელ-ფოსტა
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="შეიყვანეთ თქვენი ელ-ფოსტა"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              პაროლი
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="შეიყვანეთ თქვენი პაროლი"
            />
          </div>

          {/* 🔥 როლის არჩევის ველი გადავიტანეთ პაროლის შემდეგ */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              ვინ ხართ?
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="client">კლიენტი (ვეძებ ხელოსანს)</option>
              <option value="craftsman">ხელოსანი (ვეძებ შეკვეთას)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "იტვირთება..." : "რეგისტრაცია"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          უკვე გაქვთ ანგარიში?{" "}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            შესვლა
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;