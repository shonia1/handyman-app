// src/components/JobList.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import TelegramBanner from "./TelegramBanner";
import SEO from "./SEO";
import Breadcrumbs from "./Breadcrumbs";

function JobList() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [showArchived, setShowArchived] = useState(false);
  const [filterByCity, setFilterByCity] = useState(true);
  const limit = 6;

  const getCityParam = () => {
    if (user?.role === "craftsman" && filterByCity && user.cities?.length) {
      return user.cities[0];
    }
    return "";
  };

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit,
          search: search.trim(),
          category,
          showArchived,
        };
        const city = getCityParam();
        if (city) params.city = city;
        if (user?.role === "client") params.myJobs = true;

        const response = await api.get("/jobs", { params });
        setJobs(response.data.data);
        setTotalPages(response.data.pagination.pages);
        setTotalJobs(response.data.pagination.total);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchJobs();
  }, [page, search, category, user, showArchived, filterByCity]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        იტვირთება...
      </div>
    );
  if (error)
    return (
      <div className="text-red-500 text-center py-10">შეცდომა: {error}</div>
    );

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
      <SEO
        title="Handyman"
        description="ნახეთ ყველა აქტიური დავალება. აირჩიეთ თქვენთვის სასურველი კატეგორია და ლოკაცია."
        url="/"
      />
      <Breadcrumbs />
      <TelegramBanner />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          {user?.role === "client" ? "📋 ჩემი დავალებები" : "📋 დავალებები"}
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
            {totalJobs} ცალი
          </span>
          {user?.role === "craftsman" && user.cities?.length > 0 && (
            <button
              onClick={() => setFilterByCity(!filterByCity)}
              className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-lg transition ${
                filterByCity
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {filterByCity ? "📍 ჩემი ქალაქები" : "📍 ყველა ქალაქი"}
            </button>
          )}
          {user?.role === "client" && (
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-lg transition ${
                showArchived
                  ? "bg-gray-600 text-white hover:bg-gray-700"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {showArchived ? "📂 არქივი" : "📂 აჩვენე არქივი"}
            </button>
          )}
        </div>
      </div>

      {/* Search + Filter */}
      <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200 mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="🔎 მოძებნეთ..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1 border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="border border-gray-300 px-3 py-2 rounded-lg bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="">ყველა კატეგორია</option>
          {[...new Set(jobs.map((j) => j.category))].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {(search || category) && (
          <button
            onClick={() => {
              setSearch("");
              setCategory("");
              setPage(1);
            }}
            className="text-sm text-gray-500 hover:text-red-500 transition px-3 py-1"
          >
            ✕ გასუფთავება
          </button>
        )}
      </div>

      {/* Job Cards - Mobile Optimized */}
      {jobs.length === 0 ? (
        <div className="text-center py-12 sm:py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
          <p className="text-gray-400 text-lg sm:text-xl">
            {user?.role === "client"
              ? showArchived
                ? "📭 არქივში არ არის დავალებები"
                : "📭 ჯერ არ გაგივრცელებიათ დავალება"
              : search || category
                ? "☝️ ვერაფერი მოიძებნა"
                : "🤷‍♂️ ჯერ არ არის დავალებები"}
          </p>
          {user?.role === "client" && !showArchived && (
            <Link
              to="/post-job"
              className="text-indigo-600 hover:underline mt-2 inline-block text-sm"
            >
              + დაამატეთ პირველი დავალება
            </Link>
          )}
          {!user && (
            <Link
              to="/login"
              className="text-indigo-600 hover:underline mt-2 inline-block text-sm"
            >
              გაიარეთ ავტორიზაცია
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {jobs.map((job) => (
            <Link
              key={job._id}
              to={`/jobs/${job._id}`}
              className="block transform transition hover:scale-[1.02] duration-200"
            >
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-100 overflow-hidden h-full flex flex-col">
                <div className="px-4 sm:px-5 pt-3 sm:pt-4 pb-1 sm:pb-2 flex justify-between items-start">
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full">
                    {job.category}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full ${
                      job.status === "open"
                        ? "bg-green-100 text-green-800"
                        : job.status === "assigned"
                          ? "bg-blue-100 text-blue-800"
                          : job.status === "completed"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-red-100 text-red-800"
                    }`}
                  >
                    {job.status === "open"
                      ? "🟢 ღია"
                      : job.status === "assigned"
                        ? "🔄 მიმდინარე"
                        : job.status === "completed"
                          ? "🔒 დასრულებული"
                          : "❌ გაუქმებული"}
                  </span>
                </div>
                <div className="px-4 sm:px-5 py-1 sm:py-2 flex-grow">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 line-clamp-1">
                    {job.title}
                  </h2>
                  <p className="text-gray-500 text-xs sm:text-sm mt-1 line-clamp-2">
                    {job.description}
                  </p>
                </div>
                <div className="px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-gray-600 text-xs sm:text-sm">
                    📍 {job.district}
                  </span>
                  <span className="text-base sm:text-lg font-bold text-green-600">
                    {job.budget}{" "}
                    <span className="text-xs sm:text-sm font-normal text-gray-500">
                      GEL
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 sm:gap-4 mt-6 sm:mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            ← წინა
          </button>
          <span className="text-gray-700 text-xs sm:text-sm font-medium">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            შემდეგი →
          </button>
        </div>
      )}
    </div>
  );
}
export default JobList;
