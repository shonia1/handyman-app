// src/components/CraftsmanDashboard.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";

const CraftsmanDashboard = () => {
  const { user } = useAuth();
  const [incomingJobs, setIncomingJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncomingJobs = async () => {
      try {
        // ✅ city პარამეტრი მთლიანად მოვაშორეთ
        const params = {
          status: 'open',
          limit: 20
        };
        const response = await api.get("/jobs", { params });
        setIncomingJobs(response.data.data || []);
      } catch (err) {
        console.error("Error fetching incoming jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchIncomingJobs();
  }, [user]);

  if (loading) return <div className="text-center py-20">იტვირთება...</div>;

  if (incomingJobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">შეკვეთები ჯერ არ შემოსულა</h2>
        <p className="text-gray-500 max-w-md mb-8">როგორც კი ახალი შეკვეთა გამოქვეყნდება, ის აქ გამოჩნდება.</p>
        <Link to="/jobs" className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-105">იხილეთ ყველა დავალება</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">📬 შემოსული შეკვეთები</h2>
        <Link to="/jobs" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-full shadow hover:bg-indigo-700">ყველა დავალება</Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {incomingJobs.map((job) => (
          <Link key={job._id} to={`/jobs/${job._id}`} className="block transform hover:scale-[1.02] transition duration-200">
            <div className="border p-4 rounded-xl shadow bg-white hover:shadow-lg border-gray-100 h-full flex flex-col">
              <div className="flex justify-between items-start">
                <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-1 rounded-full">{job.category}</span>
                <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">🟢 ღია</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mt-2 mb-1 line-clamp-1">{job.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-2">{job.description}</p>
              <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center text-sm">
                <span className="text-gray-600">📍 {job.district}</span>
                <span className="font-bold text-green-600">{job.budget} GEL</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
export default CraftsmanDashboard;