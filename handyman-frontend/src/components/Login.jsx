// src/components/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">🔐 შესვლა</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <input
          type="password"
          placeholder="პაროლი *"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50 text-sm sm:text-base"
        >
          {loading ? "იტვირთება..." : "შესვლა"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        არ გაქვთ ანგარიში?{" "}
        <Link to="/register" className="text-indigo-600 hover:underline">
          რეგისტრაცია
        </Link>
      </p>
    </div>
  );
}
export default Login;