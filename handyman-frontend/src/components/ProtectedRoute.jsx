// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // 💡 შეამოწმეთ, ინახავს თუ არა მომხმარებელი ტოკენს.
  // (რეგისტრაციის ან შესვლისას თქვენს ბექენდზე წარმატებული შესვლის შემდეგ ტოკენი უნდა ჩაიწეროს localStorage-ში)
  const token = localStorage.getItem("token");

  // თუ ტოკენი არ არის, გადაამისამართეთ შესვლის გვერდზე
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // თუ ავტორიზებულია, აჩვენეთ მისთვის განკუთვნილი კომპონენტი (მაგალითად JobForm)
  return children;
};

export default ProtectedRoute;
