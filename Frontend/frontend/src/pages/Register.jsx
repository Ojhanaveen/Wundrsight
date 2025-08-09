import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/register", { name, email, password });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error?.message || "Registration failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleRegister}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
        {error && <p className="text-red-500 mb-3 text-sm">{error}</p>}
        <input
          className="border p-2 w-full mb-3 rounded focus:ring-2 focus:ring-green-500 outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />
        <input
          className="border p-2 w-full mb-3 rounded focus:ring-2 focus:ring-green-500 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          className="border p-2 w-full mb-4 rounded focus:ring-2 focus:ring-green-500 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button
          type="submit"
          className="bg-green-500 text-white p-2 w-full rounded hover:bg-green-600 transition"
        >
          Register
        </button>
      </form>
    </div>
  );
}
