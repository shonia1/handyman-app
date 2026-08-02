// src/components/Login.jsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // 1. გავიგოთ, საიდან მოვიდა მომხმარებელი (მაგალითად /create-დან)
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 2. გავაგზავნოთ მოთხოვნა ბექენდზე
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
        { email, password }
      );

      // 3. წარმატების შემთხვევაში, შევინახოთ ტოკენი
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        // 4. დავაბრუნოთ მომხმარებელი იქ, საიდანაც მოვიდა
        navigate(from, { replace: true });
      } else {
        setError("მოხდა შეცდომა. გთხოვთ, სცადოთ თავიდან.");
      }
    } catch (err) {
      // 5. შეცდომის მართვა
      setError(
        err.response?.data?.message || 
        "ავტორიზაცია ვერ მოხერხდა. შეამოწმეთ მონაცემები."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          შესვლა
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="თქვენი ელ-ფოსტა"
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
              placeholder="თქვენი პაროლი"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "იტვირთება..." : "შესვლა"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          არ გაქვთ ანგარიში?{" "}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            რეგისტრაცია
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;