import { Navigate } from "react-router-dom";

export default function AuthRedirect({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // If logged in, send them to their dashboard
  if (token && role) {
    return <Navigate to={role === "admin" ? "/admin" : "/patient"} />;
  }

  // Otherwise, allow the page to load
  return children;
}
