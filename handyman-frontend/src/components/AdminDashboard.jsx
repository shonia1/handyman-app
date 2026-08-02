// src/components/AdminDashboard.jsx
import { useEffect, useState } from "react";
import api from "../api/axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stats");
  const [selectedUser, setSelectedUser] = useState(null); // არჩეული მომხმარებლის დეტალები
  const [selectedJob, setSelectedJob] = useState(null); // არჩეული განცხადების დეტალები

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

  useEffect(() => { fetchData(); }, []);

  const handleBan = async (id, reason = "დარღვევა") => {
    if (!window.confirm("დარწმუნებული ხართ, რომ გსურთ ამ მომხმარებლის დაბლოკვა?")) return;
    try {
      await api.patch(`/admin/users/${id}/ban`, { banReason: reason });
      fetchData();
    } catch (err) {
      alert("შეცდომა: " + (err.response?.data?.error || "ბლოკირება ვერ მოხერხდა"));
    }
  };

  const handleUnban = async (id) => {
    if (!window.confirm("გსურთ ბანის მოხსნა?")) return;
    try {
      await api.patch(`/admin/users/${id}/unban`);
      fetchData();
    } catch (err) {
      alert("შეცდომა: " + (err.response?.data?.error || "ბანის მოხსნა ვერ მოხერხდა"));
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("გსურთ მომხმარებლის და მისი განცხადებების სრულად წაშლა?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchData();
    } catch (err) {
      alert("შეცდომა: " + (err.response?.data?.error || "წაშლა ვერ მოხერხდა"));
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm("გსურთ ამ განცხადების წაშლა?")) return;
    try {
      await api.delete(`/admin/jobs/${id}`);
      fetchData();
    } catch (err) {
      alert("შეცდომა: " + (err.response?.data?.error || "განცხადების წაშლა ვერ მოხერხდა"));
    }
  };

  // 🔥 განახლებული გასუფთავების ფუნქცია მათემატიკური ამოცანით
  const handleCleanup = async () => {
    // ნაბიჯი 1: პირველადი დადასტურება
    if (!window.confirm("⚠️ ეს წაშლის ყველა მომხმარებელსა და განცხადებას! დარწმუნებული ხართ?")) return;

    // ნაბიჯი 2: რანდომული მათემატიკური ამოცანის გენერაცია
    const num1 = Math.floor(Math.random() * 10) + 1; // 1-დან 10-მდე
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let correctAnswer;
    if (operator === '+') correctAnswer = num1 + num2;
    else if (operator === '-') correctAnswer = num1 - num2;
    else if (operator === '*') correctAnswer = num1 * num2;

    // ნაბიჯი 3: ვთხოვთ მომხმარებელს ამოცანის ამოხსნას
    const userAnswer = prompt(`🔐 უსაფრთხოების მიზნით, გთხოვთ ამოხსნათ მათემატიკური ამოცანა:\n\n${num1} ${operator} ${num2} = ?`);

    // ნაბიჯი 4: პასუხის შემოწმება
    if (userAnswer === null) {
      alert("ოპერაცია გაუქმდა.");
      return; // მომხმარებელმა დააჭირა Cancel
    }

    if (parseInt(userAnswer) !== correctAnswer) {
      alert("❌ პასუხი არასწორია! ოპერაცია გაუქმდა.");
      return;
    }

    // ნაბიჯი 5: თუ პასუხი სწორია, ვაგრძელებთ
    try {
      await api.post("/admin/cleanup", { confirmKey: "DELETE_ALL" });
      alert("✅ ბაზა წარმატებით გასუფთავდა!");
      fetchData();
    } catch (err) {
      alert("შეცდომა: " + (err.response?.data?.error || "გასუფთავება ვერ მოხერხდა"));
    }
  };

  if (loading) return <div className="p-10 text-center">იტვირთება ადმინის პანელი...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">🛡️ ადმინის პანელი</h1>
      <div className="flex flex-wrap gap-2 mb-6 border-b pb-2">
        {["stats", "users", "jobs"].map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-t-lg ${activeTab === t ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
            {t === "stats" ? "სტატისტიკა" : t === "users" ? "მომხმარებლები" : "განცხადებები"}
          </button>
        ))}
        <button onClick={handleCleanup} className="px-4 py-2 bg-red-600 text-white rounded-t-lg ml-auto">⚠️ მონაცემთა ბაზის გასუფთავება</button>
      </div>

      {activeTab === "stats" && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 shadow rounded-lg text-center"><p className="text-gray-500">მთლიანი მომხმარებელი</p><p className="text-2xl font-bold">{stats.totalUsers}</p></div>
          <div className="bg-white p-4 shadow rounded-lg text-center"><p className="text-gray-500">კლიენტი</p><p className="text-2xl font-bold">{stats.clients}</p></div>
          <div className="bg-white p-4 shadow rounded-lg text-center"><p className="text-gray-500">ხელოსანი</p><p className="text-2xl font-bold">{stats.craftsmen}</p></div>
          <div className="bg-white p-4 shadow rounded-lg text-center"><p className="text-gray-500">აქტიური განცხადება</p><p className="text-2xl font-bold">{stats.activeJobs}</p></div>
          <div className="bg-white p-4 shadow rounded-lg text-center"><p className="text-gray-500">დასრულებული განცხადება</p><p className="text-2xl font-bold">{stats.completedJobs}</p></div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700"><tr><th className="p-3">სახელი</th><th>ელ-ფოსტა</th><th>როლი</th><th>სტატუსი</th><th className="text-right">მოქმედება</th></tr></thead>
            <tbody>
              {users.map(u => {
                if (u.role === "admin") return null; 

                return (
                  <tr key={u._id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedUser(u)}>
                    <td className="p-3 font-medium hover:underline">{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>{u.isBanned ? <span className="text-red-600 font-bold">🛑 დაბლოკილი</span> : <span className="text-green-600">აქტიური</span>}</td>
                    <td className="text-right p-3 flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                      {u.isBanned ? (
                        <button onClick={() => handleUnban(u._id)} className="bg-green-500 text-white px-2 py-1 rounded">ბანის მოხსნა</button>
                      ) : (
                        <button onClick={() => handleBan(u._id)} className="bg-orange-500 text-white px-2 py-1 rounded">დაბლოკვა</button>
                      )}
                      <button onClick={() => handleDeleteUser(u._id)} className="bg-red-600 text-white px-2 py-1 rounded">წაშლა</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "jobs" && (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700"><tr><th className="p-3">სათაური</th><th>კატეგორია</th><th>ლოკაცია</th><th>ბიუჯეტი</th><th>სტატუსი</th><th className="text-right">მოქმედება</th></tr></thead>
            <tbody>
              {jobs.map(j => (
                <tr key={j._id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedJob(j)}>
                  <td className="p-3 font-medium hover:underline">{j.title}</td>
                  <td>{j.category}</td>
                  <td>{j.district}</td>
                  <td>{j.budget} GEL</td>
                  <td><span className={`px-2 py-1 rounded text-xs ${j.status === "open" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>{j.status}</span></td>
                  <td className="text-right p-3" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleDeleteJob(j._id)} className="bg-red-600 text-white px-2 py-1 rounded">წაშლა</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* დეტალების მოდალი (პროფილი) */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">👤 მომხმარებლის დეტალები</h2>
            <div className="space-y-2 text-gray-700">
              <p><span className="font-semibold">სახელი:</span> {selectedUser.name}</p>
              <p><span className="font-semibold">ელ-ფოსტა:</span> {selectedUser.email}</p>
              <p><span className="font-semibold">როლი:</span> {selectedUser.role}</p>
              <p><span className="font-semibold">ტელეფონი:</span> {selectedUser.phone || "N/A"}</p>
              {selectedUser.role === "craftsman" && (
                <p><span className="font-semibold">პროფესია:</span> {selectedUser.profession?.join(", ") || "N/A"}</p>
              )}
              <p><span className="font-semibold">შექმნის თარიღი:</span> {new Date(selectedUser.createdAt).toLocaleString()}</p>
              <p><span className="font-semibold">სტატუსი:</span> {selectedUser.isBanned ? "🛑 დაბლოკილი" : "🟢 აქტიური"}</p>
            </div>
            <button className="mt-6 w-full bg-gray-200 hover:bg-gray-300 py-2 rounded-lg" onClick={() => setSelectedUser(null)}>დახურვა</button>
          </div>
        </div>
      )}

      {/* დეტალების მოდალი (განცხადება) */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedJob(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">📝 განცხადების დეტალები</h2>
            <div className="space-y-2 text-gray-700">
              <p><span className="font-semibold">სათაური:</span> {selectedJob.title}</p>
              <p><span className="font-semibold">აღწერა:</span> {selectedJob.description}</p>
              <p><span className="font-semibold">კატეგორია:</span> {selectedJob.category}</p>
              <p><span className="font-semibold">ლოკაცია:</span> {selectedJob.district} - {selectedJob.address}</p>
              <p><span className="font-semibold">ბიუჯეტი:</span> {selectedJob.budget} GEL</p>
              <p><span className="font-semibold">სტატუსი:</span> {selectedJob.status}</p>
              <p><span className="font-semibold">კლიენტი:</span> {selectedJob.client?.name || selectedJob.clientName}</p>
              <p><span className="font-semibold">გამოქვეყნდა:</span> {new Date(selectedJob.createdAt).toLocaleString()}</p>
            </div>
            <button className="mt-6 w-full bg-gray-200 hover:bg-gray-300 py-2 rounded-lg" onClick={() => setSelectedJob(null)}>დახურვა</button>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminDashboard;