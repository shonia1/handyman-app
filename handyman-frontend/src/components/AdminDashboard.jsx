import { useEffect, useState } from "react";
import api from "../api/axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stats");

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, jobsRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/jobs"),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setJobs(jobsRes.data);
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBan = async (id, reason = "დარღვევა") => {
    if (
      !window.confirm("დარწმუნებული ხართ, რომ გსურთ ამ მომხმარებლის დაბლოკვა?")
    )
      return;
    try {
      await api.patch(`/admin/users/${id}/ban`, { banReason: reason });
      fetchData();
    } catch (err) {
      // 🔥 ზუსტი შეცდომის ჩვენება
      const errorMsg = err.response?.data?.error || "შეცდომა ბლოკირებისას";
      alert("შეცდომა: " + errorMsg);
    }
  };

  const handleUnban = async (id) => {
    if (!window.confirm("გსურთ ბანის მოხსნა?")) return;
    try {
      await api.patch(`/admin/users/${id}/unban`);
      fetchData();
    } catch (err) {
      const errorMsg = err.response?.data?.error || "შეცდომა ბანის მოხსნისას";
      alert("შეცდომა: " + errorMsg);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("გსურთ მომხმარებლის და მისი შეკვეთების სრულად წაშლა?"))
      return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchData();
    } catch (err) {
      // 🔥 სწორედ ეს ხაზი აჩვენებს რა ხდება სინამდვილეში!
      const errorMsg =
        err.response?.data?.error || "შეცდომა მომხმარებლის წაშლისას";
      alert("შეცდომა: " + errorMsg);
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm("გსურთ ამ შეკვეთის წაშლა?")) return;
    try {
      await api.delete(`/admin/jobs/${id}`);
      fetchData();
    } catch (err) {
      const errorMsg = err.response?.data?.error || "შეცდომა შეკვეთის წაშლისას";
      alert("შეცდომა: " + errorMsg);
    }
  };

  const handleCleanup = async () => {
    if (
      !window.confirm(
        "⚠️ ეს წაშლის ყველა მომხმარებელსა და შეკვეთას! დარწმუნებული ხართ?",
      )
    )
      return;
    const code = prompt("დადასტურებისთვის ჩაწერეთ: DELETE_ALL");
    if (code !== "DELETE_ALL") return alert("კოდი არასწორია");
    try {
      await api.post("/admin/cleanup", { confirmKey: code });
      alert("ბაზა გასუფთავდა!");
      fetchData();
    } catch (err) {
      const errorMsg = err.response?.data?.error || "შეცდომა გასუფთავებისას";
      alert("შეცდომა: " + errorMsg);
    }
  };

  if (loading)
    return <div className="p-10 text-center">იტვირთება ადმინის პანელი...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">🛡️ ადმინის პანელი</h1>
      <div className="flex flex-wrap gap-2 mb-6 border-b pb-2">
        {["stats", "users", "jobs"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-t-lg ${activeTab === t ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            {t === "stats"
              ? "სტატისტიკა"
              : t === "users"
                ? "მომხმარებლები"
                : "შეკვეთები"}
          </button>
        ))}
        <button
          onClick={handleCleanup}
          className="px-4 py-2 bg-red-600 text-white rounded-t-lg ml-auto"
        >
          ⚠️ მონაცემთა ბაზის გასუფთავება
        </button>
      </div>

      {activeTab === "stats" && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 shadow rounded-lg text-center">
            <p className="text-gray-500">მთლიანი მომხმარებელი</p>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
          </div>
          <div className="bg-white p-4 shadow rounded-lg text-center">
            <p className="text-gray-500">კლიენტი</p>
            <p className="text-2xl font-bold">{stats.clients}</p>
          </div>
          <div className="bg-white p-4 shadow rounded-lg text-center">
            <p className="text-gray-500">ხელოსანი</p>
            <p className="text-2xl font-bold">{stats.craftsmen}</p>
          </div>
          <div className="bg-white p-4 shadow rounded-lg text-center">
            <p className="text-gray-500">აქტიური შეკვეთა</p>
            <p className="text-2xl font-bold">{stats.activeJobs}</p>
          </div>
          <div className="bg-white p-4 shadow rounded-lg text-center">
            <p className="text-gray-500">დასრულებული შეკვეთა</p>
            <p className="text-2xl font-bold">{stats.completedJobs}</p>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3">სახელი</th>
                <th>ელ-ფოსტა</th>
                <th>როლი</th>
                <th>სტატუსი</th>
                <th className="text-right">მოქმედება</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    {u.isBanned ? (
                      <span className="text-red-600 font-bold">
                        🛑 დაბლოკილი
                      </span>
                    ) : (
                      <span className="text-green-600">აქტიური</span>
                    )}
                  </td>
                  <td className="text-right p-3 flex gap-2 justify-end">
                    {u.isBanned ? (
                      <button
                        onClick={() => handleUnban(u._id)}
                        className="bg-green-500 text-white px-2 py-1 rounded"
                      >
                        ბანის მოხსნა
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBan(u._id)}
                        className="bg-orange-500 text-white px-2 py-1 rounded"
                      >
                        დაბლოკვა
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteUser(u._id)}
                      className="bg-red-600 text-white px-2 py-1 rounded"
                    >
                      წაშლა
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "jobs" && (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3">სათაური</th>
                <th>კატეგორია</th>
                <th>ლოკაცია</th>
                <th>ბიუჯეტი</th>
                <th>სტატუსი</th>
                <th className="text-right">მოქმედება</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j._id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{j.title}</td>
                  <td>{j.category}</td>
                  <td>{j.district}</td>
                  <td>{j.budget} GEL</td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded text-xs ${j.status === "open" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                    >
                      {j.status}
                    </span>
                  </td>
                  <td className="text-right p-3">
                    <button
                      onClick={() => handleDeleteJob(j._id)}
                      className="bg-red-600 text-white px-2 py-1 rounded"
                    >
                      წაშლა
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default AdminDashboard;
