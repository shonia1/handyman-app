// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import JobList from "./components/JobList";
import JobDetails from "./components/JobDetails";
import JobForm from "./components/JobForm";
import Register from "./components/Register";
import Login from "./components/Login";
import GoogleAnalytics from "./components/GoogleAnalytics";
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
          <Route path="/" element={<JobList />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/post-job" element={<JobForm />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
