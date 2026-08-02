// src/components/ClientDashboard.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const ClientDashboard = () => {
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/jobs/my-jobs`, // 🔥 ჩაანაცვლეთ თქვენი ბექენდის მარშრუტით (თუ სხვაა)
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMyJobs(response.data.data || response.data); // მოარგეთ ბექენდის პასუხის სტრუქტურას
      } catch (err) {
        console.error("Error fetching my jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyJobs();
  }, []);

  if (loading) return <div className="text-center py-20">იტვირთება...</div>;

  // 🔥 თუ დავალებები არ არის, აჩვენე მხოლოდ შეკვეთის შექმნის შეთავაზება
  if (myJobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">ჯერ არ გაქვთ განთავსებული შეკვეთა</h2>
        <p className="text-gray-500 max-w-md mb-8">
          იყავით პირველი! განათავსეთ შეკვეთა და ხელოსანი თვითონ დაგიკავშირდებათ.
        </p>
        <Link
          to="/create"
          className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-105"
        >
          + ახალი შეკვეთის დამატება
        </Link>
      </div>
    );
  }

  // 🔥 თუ დავალებები აქვს, აჩვენე მათი სია
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">ჩემი დავალებები</h2>
        <Link
          to="/create"
          className="px-4 py-2 bg-blue-600 text-white font-bold rounded-full shadow hover:bg-blue-700"
        >
          + ახალი შეკვეთა
        </Link>
      </div>
      
      {/* აქ ჩასვით თქვენი JobCard კომპონენტი, ანუ დავალებების სია */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myJobs.map((job) => (
          <div key={job._id} className="border p-4 rounded-xl shadow bg-white">
             {/* ... თქვენი კარტის დიზაინი აქ ... */}
             <h3 className="text-lg font-bold">{job.title}</h3>
             <p className="text-gray-600">{job.description}</p>
             {/* ... */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientDashboard;