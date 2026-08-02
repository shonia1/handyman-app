import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") {
    return <div className="p-10 text-center text-red-600 font-bold text-xl">⛔ წვდომა აკრძალულია. მხოლოდ ადმინისთვის.</div>;
  }
  return children;
};
export default AdminRoute;