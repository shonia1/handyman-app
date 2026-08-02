// src/components/Dashboard.jsx
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import ClientDashboard from "./ClientDashboard";
import CraftsmanDashboard from "./CraftsmanDashboard";

const Dashboard = () => {
  const { user } = useAuth();

  // თუ შესული არ არის, გადაიყვანე ლოგინზე
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // როლის მიხედვით აჩვენე შესაბამისი დაფა
  if (user.role === "client") {
    return <ClientDashboard />;
  } else if (user.role === "craftsman") {
    return <CraftsmanDashboard />;
  } else {
    return <div className="text-center py-20 text-red-500">როლი არ არის ამოცნობილი</div>;
  }
};

export default Dashboard;