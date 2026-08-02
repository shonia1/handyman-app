// src/components/AdminDashboard.jsx
import { useEffect, useState, useMemo } from "react";
import api from "../api/axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stats");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  // 🔥 ძებნისა და ფილტრაციის ცვლადები
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

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

  // 🔥 გაფილტრული მონაცემები (ადგილობრივი ძებნა)
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (u.role === "admin") return false; // ადმინი არ ჩანს
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole ? u.role === filterRole : true;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, filterRole]);

  const filteredJobs = useMemo(() => {
    return jobs.filter(j => {
      const matchesSearch = j.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus ? j.status === filterStatus : true;
      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchTerm, filterStatus]);

  // ─── Handlers ──────────────────────────────
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

  // 🔥 მათემატიკური ამოცანით გასუფთავება
  const handleCleanup = async () => {
    if (!window.confirm("⚠️ ეს წაშლის ყველა მომხმარებელსა და განცხადებას! დარწმუნებული ხართ?")) return;

    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let correctAnswer;
    if (operator === '+') correctAnswer = num1 + num2;
    else if (operator === '-') correctAnswer = num1 - num2;
    else correctAnswer = num1 * num2;

    const userAnswer = prompt(`🔐 უსაფრთხოების მიზნით, გთხოვთ ამოხსნათ მათემატიკური ამოცანა:\n\n${num1} ${operator} ${num2} = ?`);
    if (userAnswer === null) return;
    if (parseInt(userAnswer) !== correctAnswer) {
      alert("❌ პასუხი არასწორია! ოპერაცია გაუქმდა.");
      return;
    }

    try {
      await api.post("/admin/cleanup", { confirmKey: "DELETE_ALL" });
      alert("✅ ბაზა წარმატებით გასუფთავდა!");
      fetchData();
    } catch (err) {
      alert("შეცდომა: " + (err.response?.data?.error || "გასუფთავება ვერ მოხერხდა"));
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500 animate-pulse">იტვირთება ადმინის პანელი...</div>;

  // ბარათების მონაცემები
  const cardData = [
    { label: "მთლიანი მომხმარებელი", value: stats.totalUsers, icon: "👥", borderColor: "border-blue-500", bg: "bg-blue-50" },
    { label: "კლიენტი", value: stats.clients, icon: "🙋", borderColor: "border-green-500", bg: "bg-green-50" },
    { label: "ხელოსანი", value: stats.craftsmen, icon: "🛠️", borderColor: "border-purple-500", bg: "bg-purple-50" },
    { label: "აქტიური განცხადება", value: stats.activeJobs, icon: "📝", borderColor: "border-orange-500", bg: "bg-orange-50" },
    { label: "დასრულებული განცხადება", value: stats.completedJobs, icon: "✅", borderColor: "border-teal-500", bg: "bg-teal-50" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">🛡️ ადმინის პანელი</h1>
        <button 
          onClick={handleCleanup} 
          className="flex items-center gap-2 text-sm bg-red-50 text-red-600 px-4 py-2 rounded-full font-medium hover:bg-red-100 transition shadow-sm border border-red-200"
        >
          ⚠️ მონაცემთა ბაზის გასუფთავება
        </button>
      </div>

      {/* 🔥 თანამედროვე Pill სტილის ჩანართები */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["stats", "users", "jobs"].map((t) => (
          <button 
            key={t} 
            onClick={() => {
              setActiveTab(t);
              setSearchTerm(""); // ჩანართის შეცვლისას ველების გასუფთავება
              setFilterRole("");
              setFilterStatus("");
            }} 
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === t ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {t === "stats" ? "📊 სტატისტიკა" : t === "users" ? "👤 მომხმარებლები" : "📋 განცხადებები"}
          </button>
        ))}
      </div>

      {/* ─── STATS ─── */}
      {activeTab === "stats" && stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {cardData.map((item, idx) => (
            <div 
              key={idx} 
              className={`relative overflow-hidden bg-white p-5 rounded-xl shadow-sm border-t-4 ${item.borderColor} hover:shadow-md transition-shadow duration-200`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{item.label}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{item.value}</p>
                </div>
                <div className={`${item.bg} p-2 rounded-full text-lg`}>
                  {item.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── USERS ─── */}
      {activeTab === "users" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* 🔥 ძებნის ზოლი */}
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="🔍 მოძებნე სახელი ან მეილი..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">ყველა როლი</option>
              <option value="client">კლიენტი</option>
              <option value="craftsman">ხელოსანი</option>
            </select>
          </div>

          {/* 🔥 ცხრილი */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr><th className="p-4">სახელი</th><th>ელ-ფოსტა</th><th>როლი</th><th>სტატუსი</th><th className="text-right">მოქმედება</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-400">მომხმარებელი არ მოიძებნა</td></tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u._id} className="odd:bg-white even:bg-gray-50/50 hover:bg-blue-50/30 transition-colors cursor-pointer" onClick={() => setSelectedUser(u)}>
                      <td className="p-4 font-medium hover:underline">{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${u.role === "client" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"}`}>
                          {u.role === "client" ? "კლიენტი" : "ხელოსანი"}
                        </span>
                      </td>
                      <td>
                        {u.isBanned 
                          ? <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">დაბლოკილი</span> 
                          : <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">აქტიური</span>}
                      </td>
                      <td className="p-4 text-right flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                        {u.isBanned ? (
                          <button onClick={() => handleUnban(u._id)} className="flex items-center gap-1 text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded shadow-sm transition">✅ მოხსნა</button>
                        ) : (
                          <button onClick={() => handleBan(u._id)} className="flex items-center gap-1 text-xs bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded shadow-sm transition">🔒 ბლოკვა</button>
                        )}
                        <button onClick={() => handleDeleteUser(u._id)} className="flex items-center gap-1 text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded shadow-sm transition">🗑 წაშლა</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── JOBS ─── */}
      {activeTab === "jobs" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* 🔥 ძებნის ზოლი */}
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="🔍 მოძებნე განცხადების სათაური..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">ყველა სტატუსი</option>
              <option value="open">🟢 ღია</option>
              <option value="assigned">🔄 მიმდინარე</option>
              <option value="completed">🔒 დასრულებული</option>
              <option value="cancelled">❌ გაუქმებული</option>
            </select>
          </div>

          {/* 🔥 ცხრილი */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr><th className="p-4">სათაური</th><th>კატეგორია</th><th>ლოკაცია</th><th>ბიუჯეტი</th><th>სტატუსი</th><th className="text-right">მოქმედება</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredJobs.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-400">განცხადება არ მოიძებნა</td></tr>
                ) : (
                  filteredJobs.map((j) => (
                    <tr key={j._id} className="odd:bg-white even:bg-gray-50/50 hover:bg-blue-50/30 transition-colors cursor-pointer" onClick={() => setSelectedJob(j)}>
                      <td className="p-4 font-medium hover:underline">{j.title}</td>
                      <td>
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">{j.category}</span>
                      </td>
                      <td>{j.district}</td>
                      <td className="font-semibold text-gray-800">{j.budget} GEL</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${j.status === "open" ? "bg-green-100 text-green-700" : j.status === "assigned" ? "bg-blue-100 text-blue-700" : j.status === "completed" ? "bg-gray-100 text-gray-700" : "bg-red-100 text-red-700"}`}>
                          {j.status === "open" ? "🟢 ღია" : j.status === "assigned" ? "🔄 მიმდინარე" : j.status === "completed" ? "🔒 დასრულებული" : "❌ გაუქმებული"}
                        </span>
                      </td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => handleDeleteJob(j._id)} className="flex items-center gap-1 text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded shadow-sm transition">🗑 წაშლა</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── DETAIL MODALS ─── */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 transform transition-all scale-100" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">👤 მომხმარებლის დეტალები</h2>
            <div className="space-y-3 text-gray-700 border-b border-gray-100 pb-4">
              <div className="grid grid-cols-2 gap-2"><span className="font-semibold text-gray-500">სახელი:</span><span>{selectedUser.name}</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="font-semibold text-gray-500">ელ-ფოსტა:</span><span>{selectedUser.email}</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="font-semibold text-gray-500">როლი:</span><span className="capitalize">{selectedUser.role}</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="font-semibold text-gray-500">ტელეფონი:</span><span>{selectedUser.phone || "N/A"}</span></div>
              {selectedUser.role === "craftsman" && (
                <div className="grid grid-cols-2 gap-2"><span className="font-semibold text-gray-500">პროფესია:</span><span>{selectedUser.profession?.join(", ") || "N/A"}</span></div>
              )}
              <div className="grid grid-cols-2 gap-2"><span className="font-semibold text-gray-500">შექმნის თარიღი:</span><span>{new Date(selectedUser.createdAt).toLocaleString()}</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="font-semibold text-gray-500">სტატუსი:</span><span>{selectedUser.isBanned ? "🛑 დაბლოკილი" : "🟢 აქტიური"}</span></div>
            </div>
            <button className="mt-5 w-full bg-gray-200 hover:bg-gray-300 py-2.5 rounded-lg font-medium transition" onClick={() => setSelectedUser(null)}>დახურვა</button>
          </div>
        </div>
      )}

      {selectedJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedJob(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 transform transition-all scale-100" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">📝 განცხადების დეტალები</h2>
            <div className="space-y-3 text-gray-700 border-b border-gray-100 pb-4">
              <div className="grid grid-cols-2 gap-2"><span className="font-semibold text-gray-500">სათაური:</span><span>{selectedJob.title}</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="font-semibold text-gray-500">აღწერა:</span><span className="line-clamp-3">{selectedJob.description}</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="font-semibold text-gray-500">კატეგორია:</span><span>{selectedJob.category}</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="font-semibold text-gray-500">ლოკაცია:</span><span>{selectedJob.district} - {selectedJob.address}</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="font-semibold text-gray-500">ბიუჯეტი:</span><span className="font-bold text-green-600">{selectedJob.budget} GEL</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="font-semibold text-gray-500">სტატუსი:</span><span className="capitalize">{selectedJob.status}</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="font-semibold text-gray-500">კლიენტი:</span><span>{selectedJob.client?.name || selectedJob.clientName}</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="font-semibold text-gray-500">გამოქვეყნდა:</span><span>{new Date(selectedJob.createdAt).toLocaleString()}</span></div>
            </div>
            <button className="mt-5 w-full bg-gray-200 hover:bg-gray-300 py-2.5 rounded-lg font-medium transition" onClick={() => setSelectedJob(null)}>დახურვა</button>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminDashboard;