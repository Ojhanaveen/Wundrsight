import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  }

  return (
    <nav className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
      <h1
        className="font-bold text-lg cursor-pointer"
        onClick={() => navigate(role === "admin" ? "/admin" : "/patient")}
      >
        Appointment Booking
      </h1>
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition"
      >
        Logout
      </button>
    </nav>
  );
}
