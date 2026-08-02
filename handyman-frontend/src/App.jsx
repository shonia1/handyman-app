// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import JobList from "./components/JobList";
import JobDetails from "./components/JobDetails";
import JobForm from "./components/JobForm";
import Register from "./components/Register";
import Login from "./components/Login";
import GoogleAnalytics from "./components/GoogleAnalytics";
import Home from "./components/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute"; // 🔥 ეს იმპორტი
import AdminDashboard from "./components/AdminDashboard"; // 🔥 ეს იმპორტი
import { useAuth } from "./hooks/useAuth";
import ClientDashboard from "./components/ClientDashboard";
import CraftsmanDashboard from "./components/CraftsmanDashboard";
import { lazy, Suspense, useMemo } from "react";

function App() {
  const { user } = useAuth();

  // 🔥 მთავარი გვერდის (/) დინამიური შერჩევა როლის მიხედვით
  const homeElement = useMemo(() => {
    if (!user) return <Home />;
    if (user.role === "admin") return <AdminDashboard />; // 🔥 დაამატეთ ეს ხაზი!
    if (user.role === "client") return <ClientDashboard />;
    if (user.role === "craftsman") return <CraftsmanDashboard />;
    return <Home />;
  }, [user]);

  return (
    <BrowserRouter>
      <GoogleAnalytics />
      <Navbar />
      <Suspense fallback={<div className="flex justify-center items-center h-64">იტვირთება...</div>}>
        <Routes>
          <Route path="/" element={homeElement} />
          <Route path="/jobs" element={<JobList />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          
          {/* 🔥 ადმინის სპეციალური მარშრუტი (სათადარიგოდ პირდაპირი წვდომისთვის) */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          <Route path="/create" element={<ProtectedRoute><JobForm /></ProtectedRoute>} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;