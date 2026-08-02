import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("client");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ name, email, password, phone, role });
      navigate("/", { replace: true });
    } catch (err) {
      const serverMessage = err.response?.data?.message || err.response?.data?.error;
      setError(serverMessage || "რეგისტრაცია ვერ მოხერხდა. სცადეთ თავიდან.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">რეგისტრაცია</h2>
        {error && (<div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm border border-red-200">{error}</div>)}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-gray-700 text-sm font-bold mb-2">სახელი / მომხმარებელი</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="შეიყვანეთ თქვენი სახელი" /></div>
          <div><label className="block text-gray-700 text-sm font-bold mb-2">ელ-ფოსტა</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="შეიყვანეთ თქვენი ელ-ფოსტა" /></div>
          <div><label className="block text-gray-700 text-sm font-bold mb-2">პაროლი</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="შეიყვანეთ თქვენი პაროლი" /></div>
          <div><label className="block text-gray-700 text-sm font-bold mb-2">მობილური ნომერი</label><input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="შეიყვანეთ მობილურის ნომერი" /></div>
          <div><label className="block text-gray-700 text-sm font-bold mb-2">ვინ ხართ?</label><select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"><option value="client">კლიენტი (ვეძებ ხელოსანს)</option><option value="craftsman">ხელოსანი (ვეძებ შეკვეთას)</option></select></div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed">{loading ? "იტვირთება..." : "რეგისტრაცია"}</button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600">უკვე გაქვთ ანგარიში? <Link to="/login" className="text-blue-600 font-semibold hover:underline">შესვლა</Link></div>
      </div>
    </div>
  );
};
export default Register;