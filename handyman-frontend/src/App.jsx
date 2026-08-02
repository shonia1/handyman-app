// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import JobList from "./components/JobList";
import JobDetails from "./components/JobDetails";
import JobForm from "./components/JobForm";
import Register from "./components/Register";
import Login from "./components/Login";
import GoogleAnalytics from "./components/GoogleAnalytics";
import Home from "./components/Home"; // 🔥 ეს ხაზი დაამატეთ!
import { lazy, Suspense } from "react";

function App() {
  return (
    <BrowserRouter>
      <GoogleAnalytics />
      <Navbar />
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-64">
            იტვირთება...
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />          {/* 🔥 მთავარი გვერდი */}
          <Route path="/jobs" element={<JobList />} />   {/* 🔥 დავალებების სია */}
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/create" element={<JobForm />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;