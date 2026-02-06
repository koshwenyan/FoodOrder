import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function PrivateRoute({ children, allowedRoles, redirectTo = "/login" }) {
  const { user } = useAuth();

  if (!user) return <Navigate to={redirectTo} />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} />; // or a 403 page
  }

  return children;
}
