import { useState, useEffect } from "react";
import api from "../api";
import Navbar from "../components/Navbar";

export default function PatientDashboard() {
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bookingError, setBookingError] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  async function loadSlots() {
    if (!fromDate || !toDate) return;
    const res = await api.get(`/slots?from=${fromDate}&to=${toDate}`);
    setSlots(res.data);
  }

  async function loadMyBookings() {
    const res = await api.get("/my-bookings");
    setBookings(res.data);
  }

  async function handleBook(slotId) {
    setBookingError("");
    try {
      await api.post("/book", { slotId });
      loadSlots();
      loadMyBookings();
    } catch (err) {
      setBookingError(err.response?.data?.error?.message || "Booking failed");
    }
  }

  async function handleCancel(bookingId) {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    setBookingError("");
    try {
      await api.delete(`/booking/${bookingId}`);
      loadSlots();
      loadMyBookings();
    } catch (err) {
      setBookingError(err.response?.data?.error?.message || "Cancellation failed");
    }
  }

  useEffect(() => {
    // Default to today and next 7 days
    const today = new Date();
    const toDay = new Date();
    toDay.setDate(today.getDate() + 7);

    const todayStr = today.toISOString().split("T")[0];
    const toDayStr = toDay.toISOString().split("T")[0];

    setFromDate(todayStr);
    setToDate(toDayStr);
  }, []);

  useEffect(() => {
    loadSlots();
    loadMyBookings();
  }, [fromDate, toDate]);

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Available Slots</h2>

        {/* Date Range Picker */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border p-2 rounded"
            />
          </div>
        </div>

        {bookingError && (
          <p className="text-red-500 mb-3 text-sm">{bookingError}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {slots.map((s) => (
            <div
              key={s.id}
              className={`p-3 border rounded flex justify-between items-center ${
                s.booked ? "bg-gray-100" : "bg-white"
              }`}
            >
              <span>{new Date(s.startAt).toLocaleString()}</span>
              {s.booked ? (
                <span className="text-red-500 text-sm">Booked</span>
              ) : (
                <button
                  onClick={() => handleBook(s.id)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Book
                </button>
              )}
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-4">My Bookings</h2>
        {bookings.map((b) => (
          <div
            key={b.id}
            className="p-3 border rounded mb-2 flex justify-between items-center"
          >
            <span>{new Date(b.slot.startAt).toLocaleString()}</span>
            <button
              onClick={() => handleCancel(b.id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
