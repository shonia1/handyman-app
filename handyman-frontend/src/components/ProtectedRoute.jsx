// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"; // ✅ იმპორტი

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth(); // ✅ ვიყენებთ კონტექსტს

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;