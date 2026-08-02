// src/components/JobDetails.jsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import BidForm from "./BidForm";
import { useAuth } from "../hooks/useAuth";
import SEO from "./SEO";
import JobSchema from "./JobSchema";
import Breadcrumbs from "./Breadcrumbs";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [bidsError, setBidsError] = useState(null);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [processingBid, setProcessingBid] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // Questions
  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState("");
  const [questionSubmitting, setQuestionSubmitting] = useState(false);
  const [replyText, setReplyText] = useState({});
  const [replySubmitting, setReplySubmitting] = useState({});

  // Timer
  const [acceptedBidId, setAcceptedBidId] = useState(null);
  const [timer, setTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);

  // ── Data fetching ──────────────────────────────
  const fetchData = async () => {
    try {
      const [jobRes, bidsRes] = await Promise.all([
        api.get(`/jobs/${id}`),
        user
          ? api.get(`/bids/job/${id}`).catch((err) => {
              if (err.response?.status === 404) {
                setBidsError("ჯერ არ არის შეთავაზებები");
                return { data: { data: [] } };
              }
              throw err;
            })
          : Promise.resolve({ data: { data: [] } }),
      ]);
      setJob(jobRes.data.data);
      if (bidsRes && bidsRes.data) {
        setBids(bidsRes.data.data);
        setBidsError(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, user]);

  // ── Fetch questions ──────────────────────────────
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await api.get(`/questions/job/${id}`);
        setQuestions(res.data.data);
      } catch (err) {
        console.error("Error fetching questions:", err);
      }
    };
    fetchQuestions();
  }, [id]);

  // ── Timer for accepted_pending ──────────────────
  useEffect(() => {
    if (!user || user.role !== "craftsman") return;
    const acceptedBid = bids.find(
      (b) => b.craftsman === user.id && b.status === "accepted_pending",
    );
    if (acceptedBid) {
      setAcceptedBidId(acceptedBid._id);
      const now = new Date();
      const acceptedAt = new Date(acceptedBid.acceptedAt);
      const elapsed = (now - acceptedAt) / 1000;
      const remaining = Math.max(0, 300 - elapsed);
      setTimer(Math.floor(remaining));

      if (timerInterval) clearInterval(timerInterval);
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            fetchData();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setTimerInterval(interval);

      return () => clearInterval(interval);
    } else {
      if (timerInterval) clearInterval(timerInterval);
      setTimerInterval(null);
      setTimer(0);
      setAcceptedBidId(null);
    }
  }, [bids, user]);

  // ── Handlers ────────────────────────────────────
  const handleStatusChange = async (newStatus) => {
    if (!user) {
      alert("გთხოვთ, გაიარეთ ავტორიზაცია");
      return;
    }
    const actionMap = { completed: "დასრულება", cancelled: "გაუქმება" };
    if (
      !window.confirm(
        `დარწმუნებული ხართ, რომ გსურთ დავალების "${actionMap[newStatus]}"?`,
      )
    ) {
      return;
    }
    setUpdating(true);
    try {
      const response = await api.patch(`/jobs/${id}`, { status: newStatus });
      setJob(response.data.data);
      if (newStatus === "completed") {
        navigate("/");
      }
    } catch (err) {
      alert("❌ შეცდომა: " + (err.response?.data?.error || err.message));
    } finally {
      setUpdating(false);
    }
  };

  const handleBidStatus = async (bidId, status) => {
    if (!user) return;
    setProcessingBid(bidId);
    try {
      const response = await api.patch(`/bids/${bidId}/status`, { status });
      setBids((prev) =>
        prev.map((b) => (b._id === bidId ? response.data.data : b)),
      );
      if (status === "accepted") {
        const jobRes = await api.get(`/jobs/${id}`);
        setJob(jobRes.data.data);
      }
    } catch (err) {
      alert("❌ შეცდომა: " + (err.response?.data?.error || err.message));
    } finally {
      setProcessingBid(null);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("დარწმუნებული ხართ, რომ გსურთ ამ დავალების წაშლა?")) {
      return;
    }
    setDeleting(true);
    try {
      await api.delete(`/jobs/${id}`);
      navigate("/");
    } catch (err) {
      alert("❌ შეცდომა: " + (err.response?.data?.error || err.message));
      setDeleting(false);
    }
  };

  const handleAcceptJob = async () => {
    if (!user) {
      alert("გთხოვთ, გაიარეთ ავტორიზაცია");
      return;
    }
    if (!window.confirm(`დარწმუნებული ხართ, რომ გსურთ ამ დავალების აღება?`)) {
      return;
    }
    setUpdating(true);
    try {
      const response = await api.post(`/jobs/${id}/accept`);
      setJob(response.data.data.job);
      const newBid = response.data.data.bid;
      setBids((prev) => [newBid, ...prev]);
    } catch (err) {
      alert("❌ შეცდომა: " + (err.response?.data?.error || err.message));
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelBid = async () => {
    if (!acceptedBidId) return;
    if (!window.confirm("დარწმუნებული ხართ, რომ გსურთ შეთავაზების გაუქმება?"))
      return;
    setIsCancelling(true);
    try {
      await api.post(`/bids/${acceptedBidId}/cancel`);
      await fetchData();
    } catch (err) {
      alert("❌ შეცდომა: " + (err.response?.data?.error || err.message));
    } finally {
      setIsCancelling(false);
    }
  };

  const handleConfirmBid = async () => {
    if (!acceptedBidId) return;
    if (!window.confirm("დარწმუნებული ხართ, რომ გსურთ დავალების დადასტურება?"))
      return;
    setIsConfirming(true);
    try {
      await api.post(`/bids/${acceptedBidId}/confirm`);
      await fetchData();
    } catch (err) {
      alert("❌ შეცდომა: " + (err.response?.data?.error || err.message));
    } finally {
      setIsConfirming(false);
    }
  };

  // ── Question handlers ────────────────────────────
  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("გთხოვთ, გაიარეთ ავტორიზაცია");
      return;
    }
    if (!questionText.trim()) return;

    if (user.role === "craftsman") {
      const pendingCount = questions.filter(
        (q) => q.status === "pending" && q.author === user.id,
      ).length;
      if (pendingCount >= 3) {
        alert("თქვენ გაქვთ 3 დაუსრულებელი კითხვა.");
        return;
      }
    }

    setQuestionSubmitting(true);
    try {
      const res = await api.post("/questions", { job: id, text: questionText });
      setQuestions((prev) => [...prev, res.data.data]);
      setQuestionText("");
    } catch (err) {
      alert("❌ შეცდომა: " + (err.response?.data?.error || err.message));
    } finally {
      setQuestionSubmitting(false);
    }
  };

  const handleSubmitReply = async (questionId) => {
    const text = replyText[questionId];
    if (!text || !text.trim()) return;

    const findQuestion = (items) => {
      for (const item of items) {
        if (item._id === questionId) return item;
        if (item.replies) {
          const found = findQuestion(item.replies);
          if (found) return found;
        }
      }
      return null;
    };
    const question = findQuestion(questions);
    if (question && question.status === "answered") {
      alert("ამ კითხვაზე უკვე უპასუხა კლიენტმა.");
      return;
    }

    setReplySubmitting((prev) => ({ ...prev, [questionId]: true }));
    try {
      const res = await api.post(`/questions/${questionId}/reply`, { text });
      setQuestions((prev) => {
        const updateTree = (items) =>
          items.map((item) => {
            if (item._id === questionId) {
              const replies = item.replies || [];
              const newReply = res.data.data;
              if (newReply.status === "answered") {
                return {
                  ...item,
                  status: "answered",
                  replies: [...replies, newReply],
                };
              }
              return { ...item, replies: [...replies, newReply] };
            }
            if (item.replies) {
              return { ...item, replies: updateTree(item.replies) };
            }
            return item;
          });
        return updateTree(prev);
      });
      setReplyText((prev) => ({ ...prev, [questionId]: "" }));
    } catch (err) {
      alert("❌ შეცდომა: " + (err.response?.data?.error || err.message));
    } finally {
      setReplySubmitting((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  // ── Timer formatting ──────────────────────────────
  const formatTimer = (seconds) => {
    if (seconds > 240) return "5 წთ";
    if (seconds > 180) return "4 წთ";
    if (seconds > 120) return "3 წთ";
    if (seconds > 60) return "2 წთ";
    if (seconds > 0) return "<1 წთ";
    return "0 წთ";
  };

  // ── Loading / Error ──────────────────────────────
  if (loading && !job) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        იტვირთება...
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-red-500 text-center py-10">შეცდომა: {error}</div>
    );
  }
  if (!job) {
    return (
      <div className="text-center py-10 text-gray-500">
        დავალება არ მოიძებნა
      </div>
    );
  }

  const isOwner = user && job.client === user.id;
  const isCraftsman = user && user.role === "craftsman";
  const acceptedBid = bids.find(
    (b) => b.status === "accepted" || b.status === "accepted_pending",
  );
  const isCraftsmanAccepted = acceptedBid && acceptedBid.craftsman === user?.id;
  const isPendingConfirmation =
    acceptedBid && acceptedBid.status === "accepted_pending";
  const canCancel = isPendingConfirmation && timer > 0;
  const canConfirm = isPendingConfirmation;
  const isJobClosedForQuestions =
    (job.status === "assigned" || job.status === "completed") &&
    acceptedBid?.status === "accepted";

  const getStatusBadge = () => {
    switch (job.status) {
      case "open":
        return { label: "🟢 ღია", color: "bg-green-100 text-green-700" };
      case "assigned":
        return { label: "🔄 მიმდინარე", color: "bg-blue-100 text-blue-700" };
      case "completed":
        return { label: "🔒 დასრულებული", color: "bg-gray-100 text-gray-700" };
      case "cancelled":
        return { label: "❌ გაუქმებული", color: "bg-red-100 text-red-700" };
      default:
        return { label: job.status, color: "bg-gray-100 text-gray-700" };
    }
  };
  const statusBadge = getStatusBadge();

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
      <JobSchema job={job} />
      <SEO
        title={`${job.title} – Handyman`}
        description={`${job.category} – ${job.district}. ბიუჯეტი: ${job.budget} GEL. ${job.description.substring(0, 150)}`}
        image={job.photos?.[0] || "/logo512.png"}
        url={`/jobs/${job._id}`}
        type="article"
      />
      <Breadcrumbs />
      <Link
        to="/"
        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-3 sm:mb-4 text-sm sm:text-base"
      >
        ← უკან დაბრუნება
      </Link>

      {/* JOB CARD */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
            {job.title}
          </h1>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span
              className={`text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1 sm:py-1.5 rounded-full ${statusBadge.color}`}
            >
              {statusBadge.label}
            </span>

            {isOwner && (
              <div className="flex gap-1 sm:gap-2 flex-wrap">
                {(job.status === "open" || job.status === "assigned") && (
                  <>
                    <button
                      onClick={() => handleStatusChange("completed")}
                      disabled={updating}
                      className="bg-green-600 hover:bg-green-700 text-white px-2 sm:px-4 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition disabled:opacity-50"
                    >
                      ✅ დასრულება
                    </button>
                    <button
                      onClick={() => handleStatusChange("cancelled")}
                      disabled={updating}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 sm:px-4 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition disabled:opacity-50"
                    >
                      ❌ გაუქმება
                    </button>
                  </>
                )}
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-2 sm:px-4 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition disabled:opacity-50"
                >
                  {deleting ? "..." : "🗑 წაშლა"}
                </button>
              </div>
            )}

            {isCraftsman && job.status === "open" && !acceptedBid && (
              <button
                onClick={handleAcceptJob}
                disabled={updating}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-semibold transition disabled:opacity-50"
              >
                {updating ? "..." : "✅ აღება"}
              </button>
            )}
            {isCraftsmanAccepted && (
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                {canConfirm && (
                  <button
                    onClick={handleConfirmBid}
                    disabled={isConfirming}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition disabled:opacity-50"
                  >
                    {isConfirming ? "..." : "✅ დადასტურება"}
                  </button>
                )}
                {canCancel && (
                  <button
                    onClick={handleCancelBid}
                    disabled={isCancelling}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition disabled:opacity-50"
                  >
                    {isCancelling ? "..." : `⏳ ${formatTimer(timer)}`}
                  </button>
                )}
                {!canCancel && !canConfirm && (
                  <span className="bg-blue-100 text-blue-700 px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold">
                    თქვენ აიღეთ
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3 mt-3">
          <span className="bg-indigo-50 text-indigo-700 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full">
            {job.category}
          </span>
          <span className="bg-gray-50 text-gray-600 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full">
            📍 {job.district}
          </span>
        </div>

        <div className="mt-4 sm:mt-6">
          <p className="text-gray-700 text-sm sm:text-base whitespace-pre-wrap leading-relaxed">
            {job.description}
          </p>
        </div>

        <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center">
          <span className="text-gray-600 text-sm sm:text-base">💰 ბიუჯეტი</span>
          <span className="text-xl sm:text-2xl md:text-3xl font-bold text-green-700">
            {job.budget} GEL
          </span>
        </div>

        {/* Client info */}
        <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm border-t border-gray-100 pt-4 sm:pt-6">
          <div>
            <span className="text-gray-500">კლიენტი</span>
            <p className="font-semibold">
              {!user
                ? "🔒 სავალდებულოა ავტორიზაცია"
                : isOwner || acceptedBid?.status === "accepted"
                  ? job.clientName
                  : isCraftsman && acceptedBid?.status === "accepted_pending"
                    ? `⏳ ${formatTimer(timer)}`
                    : "🔒 სავალდებულოა ავტორიზაცია"}
            </p>
          </div>
          <div>
            <span className="text-gray-500">ტელეფონი</span>
            <p className="font-semibold">
              {!user
                ? "🔒 სავალდებულოა ავტორიზაცია"
                : isOwner || acceptedBid?.status === "accepted"
                  ? job.clientPhone
                  : isCraftsman && acceptedBid?.status === "accepted_pending"
                    ? `⏳ ${formatTimer(timer)}`
                    : "🔒 სავალდებულოა ავტორიზაცია"}
            </p>
          </div>
          <div>
            <span className="text-gray-500">გამოქვეყნდა</span>
            <p className="font-semibold">
              {new Date(job.createdAt).toLocaleDateString()}
            </p>
          </div>
          {job.address && (
            <div>
              <span className="text-gray-500">მისამართი</span>
              <p className="font-semibold">
                {!user
                  ? "🔒 სავალდებულოა ავტორიზაცია"
                  : isOwner || acceptedBid?.status === "accepted"
                    ? job.address
                    : isCraftsman && acceptedBid?.status === "accepted_pending"
                      ? `⏳ ${formatTimer(timer)}`
                      : "🔒 სავალდებულოა ავტორიზაცია"}
              </p>
            </div>
          )}
        </div>

        {/* Craftsman info for client */}
        {isOwner &&
          acceptedBid &&
          acceptedBid.status === "accepted" &&
          (job.status === "assigned" || job.status === "completed") && (
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-xs sm:text-sm font-semibold text-blue-700 mb-2">
                👷 ხელოსნის ინფორმაცია
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                <div>
                  <span className="text-gray-500">სახელი</span>
                  <p className="font-semibold">{acceptedBid.craftsmanName}</p>
                </div>
                <div>
                  <span className="text-gray-500">ტელეფონი</span>
                  <p className="font-semibold">{acceptedBid.craftsmanPhone}</p>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* BIDS */}
      <div className="mt-6 sm:mt-10">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
          📩 შეთავაზებები{" "}
          <span className="text-sm font-normal text-gray-500">
            ({bids.length})
          </span>
        </h2>

        {bidsError ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-3 sm:p-4 rounded-xl mt-3 sm:mt-4 text-center text-sm">
            {bidsError}
          </div>
        ) : bidsLoading ? (
          <div className="text-center text-gray-400 mt-3 sm:mt-4">
            იტვირთება...
          </div>
        ) : bids.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-6 sm:p-8 text-center text-gray-400 mt-3 sm:mt-4 text-sm sm:text-base">
            ჯერ არ არის შეთავაზებები
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
            {bids.map((bid) => (
              <div
                key={bid._id}
                className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0">
                  <div>
                    <p className="font-bold text-gray-800 text-sm sm:text-base">
                      {bid.craftsmanName}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {bid.craftsmanPhone}
                    </p>
                    <p className="text-gray-600 text-sm sm:text-base mt-1 sm:mt-2">
                      {bid.message}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg sm:text-xl font-bold text-green-600">
                      {bid.offeredPrice} GEL
                    </p>
                    <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full mt-1">
                      {bid.status}
                    </span>
                  </div>
                </div>

                {isOwner && bid.status === "pending" && (
                  <div className="mt-3 sm:mt-4 border-t border-gray-100 pt-3 sm:pt-4 flex gap-2 sm:gap-3">
                    <button
                      onClick={() => handleBidStatus(bid._id, "accepted")}
                      disabled={processingBid === bid._id}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition disabled:opacity-50"
                    >
                      ✅ დათანხმება
                    </button>
                    <button
                      onClick={() => handleBidStatus(bid._id, "rejected")}
                      disabled={processingBid === bid._id}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition disabled:opacity-50"
                    >
                      ❌ უარყოფა
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {isCraftsman && job.status === "open" && !acceptedBid && (
          <div className="mt-4 sm:mt-6 bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <BidForm
              jobId={id}
              onBidAdded={(newBid) => setBids([...bids, newBid])}
            />
          </div>
        )}
      </div>

      {/* QUESTIONS & ANSWERS */}
      <div className="mt-6 sm:mt-10 bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2 mb-3 sm:mb-4">
          💬 კითხვები
          {user && user.role === "craftsman" && !isJobClosedForQuestions && (
            <span className="text-xs sm:text-sm font-normal text-gray-500 ml-2">
              (დარჩენილი:{" "}
              {Math.max(
                0,
                3 -
                  questions.filter(
                    (q) => q.status === "pending" && q.author === user.id,
                  ).length,
              )}
              )
            </span>
          )}
        </h2>

        {isJobClosedForQuestions ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-3 sm:p-4 rounded-xl text-center text-sm sm:text-base">
            🔒 დავალება დახურულია კომუნიკაციისთვის. გთხოვთ, დაუკავშირდით
            ტელეფონით.
          </div>
        ) : (
          <>
            {questions.length === 0 ? (
              <p className="text-gray-400 text-center py-3 sm:py-4 text-sm">
                ჯერ არ არის კითხვები
              </p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {questions.map((q) => {
                  const isAuthor = user && q.author === user.id;
                  const isPending = q.status === "pending";
                  const canEditQuestion = isAuthor && isPending && !q.parent;
                  const isJobOwner = user && job && job.client === user.id;

                  return (
                    <div key={q._id} className="border-b border-gray-100 pb-3">
                      <div className="flex flex-wrap items-center justify-between gap-1 sm:gap-2 text-xs sm:text-sm">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-indigo-600">
                            {q.authorName}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {new Date(q.createdAt).toLocaleString()}
                          </span>
                          {q.editedAt && (
                            <span className="text-xs text-gray-400">
                              (რედ.)
                            </span>
                          )}
                          {q.status === "answered" && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                              ✅
                            </span>
                          )}
                        </div>
                        {canEditQuestion && (
                          <button
                            onClick={() => {
                              const newText = prompt("რედაქტირება:", q.text);
                              if (newText && newText.trim()) {
                                api
                                  .patch(`/questions/${q._id}`, {
                                    text: newText.trim(),
                                  })
                                  .then((res) => {
                                    const updated = res.data.data;
                                    setQuestions((prev) => {
                                      const updateTree = (items) =>
                                        items.map((item) => {
                                          if (item._id === q._id) {
                                            return {
                                              ...item,
                                              text: updated.text,
                                              editedAt: updated.editedAt,
                                            };
                                          }
                                          if (item.replies) {
                                            return {
                                              ...item,
                                              replies: updateTree(item.replies),
                                            };
                                          }
                                          return item;
                                        });
                                      return updateTree(prev);
                                    });
                                  })
                                  .catch((err) =>
                                    alert(
                                      "❌ " +
                                        (err.response?.data?.error ||
                                          err.message),
                                    ),
                                  );
                              }
                            }}
                            className="text-xs text-indigo-600 hover:text-indigo-800"
                          >
                            ✏️
                          </button>
                        )}
                      </div>
                      <p className="text-gray-700 mt-1 text-sm sm:text-base">
                        {q.text}
                      </p>

                      {/* Replies */}
                      {q.replies && q.replies.length > 0 && (
                        <div className="ml-4 sm:ml-6 mt-2 sm:mt-3 space-y-2 border-l-2 border-gray-200 pl-3 sm:pl-4">
                          {q.replies.map((r) => {
                            const isReplyAuthor = user && r.author === user.id;
                            return (
                              <div key={r._id}>
                                <div className="flex flex-wrap items-center justify-between gap-1 text-xs sm:text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-green-600">
                                      {r.authorName}
                                    </span>
                                    <span className="text-gray-400 text-xs">
                                      {new Date(r.createdAt).toLocaleString()}
                                    </span>
                                    {r.editedAt && (
                                      <span className="text-xs text-gray-400">
                                        (რედ.)
                                      </span>
                                    )}
                                  </div>
                                  {isReplyAuthor && (
                                    <button
                                      onClick={() => {
                                        const newText = prompt(
                                          "რედაქტირება:",
                                          r.text,
                                        );
                                        if (newText && newText.trim()) {
                                          api
                                            .patch(`/questions/${r._id}`, {
                                              text: newText.trim(),
                                            })
                                            .then((res) => {
                                              const updated = res.data.data;
                                              setQuestions((prev) => {
                                                const updateTree = (items) =>
                                                  items.map((item) => {
                                                    if (item._id === q._id) {
                                                      const replies =
                                                        item.replies.map(
                                                          (reply) =>
                                                            reply._id === r._id
                                                              ? {
                                                                  ...reply,
                                                                  text: updated.text,
                                                                  editedAt:
                                                                    updated.editedAt,
                                                                }
                                                              : reply,
                                                        );
                                                      return {
                                                        ...item,
                                                        replies,
                                                      };
                                                    }
                                                    if (item.replies) {
                                                      return {
                                                        ...item,
                                                        replies: updateTree(
                                                          item.replies,
                                                        ),
                                                      };
                                                    }
                                                    return item;
                                                  });
                                                return updateTree(prev);
                                              });
                                            })
                                            .catch((err) =>
                                              alert(
                                                "❌ " +
                                                  (err.response?.data?.error ||
                                                    err.message),
                                              ),
                                            );
                                        }
                                      }}
                                      className="text-xs text-indigo-600 hover:text-indigo-800"
                                    >
                                      ✏️
                                    </button>
                                  )}
                                </div>
                                <p className="text-gray-700 text-sm sm:text-base">
                                  {r.text}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Reply form */}
                      {isJobOwner && q.status === "pending" && (
                        <div className="mt-2 flex gap-2">
                          <input
                            type="text"
                            placeholder="უპასუხეთ..."
                            value={replyText[q._id] || ""}
                            onChange={(e) =>
                              setReplyText((prev) => ({
                                ...prev,
                                [q._id]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmitReply(q._id);
                              }
                            }}
                            className="flex-1 border border-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                          <button
                            onClick={() => handleSubmitReply(q._id)}
                            disabled={replySubmitting[q._id]}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                          >
                            {replySubmitting[q._id] ? "..." : "გაგზავნა"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* New Question Form */}
            {user && user.role === "craftsman" && !isJobClosedForQuestions && (
              <>
                {(() => {
                  const pendingCount = questions.filter(
                    (q) => q.status === "pending" && q.author === user.id,
                  ).length;
                  const canAsk = pendingCount < 3;
                  return (
                    <form
                      onSubmit={handleSubmitQuestion}
                      className="mt-3 sm:mt-4 flex gap-2"
                    >
                      <input
                        type="text"
                        placeholder={
                          canAsk ? "დასვით კითხვა..." : "3 დაუსრულებელი კითხვა"
                        }
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        disabled={!canAsk}
                        className={`flex-1 border p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${
                          !canAsk
                            ? "bg-gray-100 text-gray-400"
                            : "border-gray-300"
                        }`}
                      />
                      <button
                        type="submit"
                        disabled={!canAsk || questionSubmitting}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-5 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                      >
                        {questionSubmitting ? "..." : "კითხვა"}
                      </button>
                    </form>
                  );
                })()}
              </>
            )}

            {user && user.role === "client" && !isJobClosedForQuestions && (
              <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4 text-center">
                თქვენ შეგიძლიათ უპასუხოთ კითხვებს (იხ. ზემოთ).
              </p>
            )}

            {!user && (
              <p className="text-xs sm:text-sm text-gray-400 mt-3 sm:mt-4 text-center">
                კითხვის დასმისთვის გაიარეთ ავტორიზაცია
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
export default JobDetails;
