// src/components/Profile.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axios";

const Profile = () => {
  const { user, refreshUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    profession: [],
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // ავტომატურად შეავსე ველები რედაქტირების დაწყებისას
  useEffect(() => {
    if (isEditing && user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        profession: user.profession || [],
      });
    }
  }, [isEditing, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfessionChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      profession: value.split(",").map((s) => s.trim()).filter(Boolean),
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // ძირითადი ინფოს შენახვა
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await api.patch("/auth/profile", {
        name: formData.name,
        phone: formData.phone,
        profession: formData.profession,
      });

      setMessage({ type: "success", text: "✅ პროფილი წარმატებით განახლდა!" });
      if (refreshUser) await refreshUser();
      setIsEditing(false);
    } catch (err) {
      setMessage({ 
        type: "error", 
        text: "❌ შეცდომა: " + (err.response?.data?.error || "ვერ მოხერხდა განახლება") 
      });
    } finally {
      setLoading(false);
    }
  };

  // პაროლის შენახვა
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setMessage({ type: "error", text: "❌ გთხოვთ, შეავსოთ ორივე ველი!" });
      return;
    }
    setPasswordLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await api.put("/auth/password", passwordData);
      setMessage({ type: "success", text: "✅ პაროლი წარმატებით განახლდა!" });
      setPasswordData({ currentPassword: "", newPassword: "" });
      setIsPasswordChanging(false);
    } catch (err) {
      setMessage({ 
        type: "error", 
        text: "❌ შეცდომა: " + (err.response?.data?.error || "პაროლის შეცვლა ვერ მოხერხდა") 
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsPasswordChanging(false);
    setMessage({ type: "", text: "" });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">👤 ჩემი პროფილი</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            ✏️ რედაქტირება
          </button>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        {message.text && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {isEditing ? (
          <div className="space-y-4">
            {/* 1. ინფოს ფორმა */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-500 text-sm mb-1">სახელი</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-1">ელ-ფოსტა</label>
                <input
                  type="text"
                  value={user?.email}
                  disabled
                  className="w-full border border-gray-200 bg-gray-50 p-2 rounded-lg text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">ელ-ფოსტის შეცვლა შეუძლებელია</p>
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-1">ტელეფონი</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-1">როლი</label>
                <input
                  type="text"
                  value={
                    user?.role === "client"
                      ? "კლიენტი"
                      : user?.role === "craftsman"
                      ? "ხელოსანი"
                      : "ადმინი"
                  }
                  disabled
                  className="w-full border border-gray-200 bg-gray-50 p-2 rounded-lg text-gray-500 cursor-not-allowed"
                />
              </div>
              {user?.role === "craftsman" && (
                <div>
                  <label className="block text-gray-500 text-sm mb-1">პროფესია (მძიმით გამოყოფილი)</label>
                  <input
                    type="text"
                    value={formData.profession.join(", ")}
                    onChange={handleProfessionChange}
                    placeholder="მაგ. სანტექნიკა, ელექტრიკა"
                    className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {loading ? "ინახება..." : "💾 შენახვა"}
                </button>
              </div>
            </form>

            {/* 2. პაროლის ცვლილების სექცია */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsPasswordChanging(!isPasswordChanging)}
                className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm transition"
              >
                {isPasswordChanging
                  ? "⬆ დახურე პაროლის ცვლილება"
                  : "🔑 პაროლის შეცვლა"}
              </button>

              {isPasswordChanging && (
                <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-gray-500 text-sm mb-1">მიმდინარე პაროლი</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-sm mb-1">ახალი პაროლი</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {passwordLoading ? "ინახება..." : "პაროლის განახლება"}
                  </button>
                </form>
              )}
            </div>

            {/* 3. გაუქმების ღილაკი (მთლიანი რედაქტირებისთვის) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                გაუქმება
              </button>
            </div>
          </div>
        ) : (
          // ჩვენების რეჟიმი
          <div className="space-y-4">
            <div>
              <span className="text-gray-500 text-sm block">სახელი</span>
              <p className="text-lg font-semibold">{user?.name}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm block">ელ-ფოსტა</span>
              <p className="text-lg font-semibold">{user?.email}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm block">ტელეფონი</span>
              <p className="text-lg font-semibold">{user?.phone}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm block">როლი</span>
              <p className="text-lg font-semibold capitalize">
                {user?.role === "client"
                  ? "კლიენტი"
                  : user?.role === "craftsman"
                  ? "ხელოსანი"
                  : "ადმინი"}
              </p>
            </div>
            {user?.role === "craftsman" && (
              <div>
                <span className="text-gray-500 text-sm block">პროფესია</span>
                <p className="text-lg font-semibold">{user?.profession?.join(", ")}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;