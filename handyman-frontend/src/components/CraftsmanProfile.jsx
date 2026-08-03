// src/components/CraftsmanProfile.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import SEO from "./SEO";

const CraftsmanProfile = () => {
  const { id } = useParams();
  const [craftsman, setCraftsman] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ ბექენდიდან ვიღებთ ხელოსნის ინფოს და სტატისტიკას
        const [profileRes, statsRes] = await Promise.all([
          api.get(`/craftsmen/${id}`),
          api.get(`/craftsmen/${id}/stats`),
        ]);
        setCraftsman(profileRes.data.data);
        setStats(statsRes.data.data);
      } catch (err) {
        setError(err.response?.data?.error || "მონაცემების მიღება ვერ მოხერხდა");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="text-center py-20">იტვირთება...</div>;
  if (error) return <div className="text-center text-red-500 py-20">{error}</div>;
  if (!craftsman) return <div className="text-center py-20">ხელოსანი არ მოიძებნა</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <SEO
        title={`${craftsman.name} – ხელოსნის პროფილი`}
        description={`იხილეთ ხელოსნის სტატისტიკა და შესრულებული სამუშაოები.`}
        url={`/craftsman/${id}`}
      />
      <Link to="/jobs" className="text-indigo-600 hover:underline mb-4 inline-block">← დაბრუნდით დავალებებზე</Link>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800">{craftsman.name}</h1>
        <p className="text-gray-600 mt-1">📞 {craftsman.phone}</p>
        <p className="text-gray-500 text-sm mt-2">წევრია {new Date(craftsman.createdAt).toLocaleDateString()}-დან</p>

        <hr className="my-6" />

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">📊 შესრულებული სამუშაოების სტატისტიკა</h2>
        {stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-500 text-sm">სულ დასრულებული</p>
              <p className="text-3xl font-bold text-green-600">{stats.totalCompleted}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-500 text-sm">კატეგორიები</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {stats.categories && stats.categories.map(cat => (
                  <span key={cat} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-semibold">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-400">სტატისტიკა ჯერ არ არის ხელმისაწვდომი.</p>
        )}

        {stats && stats.recentJobs && stats.recentJobs.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">🕒 ბოლო დასრულებული დავალებები</h3>
            <div className="space-y-3">
              {stats.recentJobs.map(job => (
                <div key={job._id} className="border-b border-gray-100 pb-3 last:border-0">
                  <p className="font-medium text-gray-800">{job.title}</p>
                  <p className="text-sm text-gray-500">{job.category} • {job.district} • {new Date(job.completedAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CraftsmanProfile;