import { useEffect, useState } from "react";
import api from "../api";
import Navbar from "../components/Navbar";

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);

  async function loadBookings() {
    const res = await api.get("/all-bookings");
    setBookings(res.data);
  }

  useEffect(() => {
    loadBookings();
  }, []);

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">All Bookings</h2>
        {bookings.map((b) => (
          <div
            key={b.id}
            className="p-3 border rounded mb-2 flex justify-between items-center"
          >
            <span>{new Date(b.slot.startAt).toLocaleString()}</span>
            <span className="text-gray-600">
              {b.user.name} ({b.user.email})
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
