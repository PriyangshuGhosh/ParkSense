// src/pages/ParkingGrid.tsx
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { useSecureApi } from "../api/api";

type SpotStatus = "available" | "booked" | "inBooking";

interface ParkingSpot {
  id: string;
  status: SpotStatus;
}

export default function ParkingGrid() {
  const navigate = useNavigate();
  const { spot } = useParams<{ spot: string }>(); // lowercase id (e.g., "ict")
  const { user, loading: authLoading } = useAuth();
  const { secureFetch } = useSecureApi();

  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [spotIdToBook, setSpotIdToBook] = useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({ name: "Loading...", email: "", vehicle: "Car", payment: "UPI" });

  const [parkingSpots] = useState<ParkingSpot[]>([
    { id: "1A", status: "available" },
    { id: "2A", status: "available" },
    { id: "3A", status: "inBooking" },
    { id: "4A", status: "available" },
    { id: "5A", status: "available" },
    { id: "6A", status: "available" },
    { id: "1B", status: "available" },
    { id: "2B", status: "booked" },
    { id: "3B", status: "available" },
    { id: "4B", status: "available" },
    { id: "5B", status: "available" },
    { id: "6B", status: "available" },
  ]);

  useEffect(() => {
    if (!authLoading && user?.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
      }));
      if (spot) {
        const baseSpotId = `${spot.toLowerCase()}-1A`; // keep lowercase
        setSpotIdToBook(baseSpotId);
        setSelectedSpot("1A");
      }
    }
  }, [authLoading, user, spot]);

  const handleSpotClick = (id: string) => {
    setSelectedSpot(id);
    if (spot) setSpotIdToBook(`${spot.toLowerCase()}-${id}`);
  };

  const handleConfirm = async () => {
    if (!spotIdToBook) {
      alert("Please select a spot before booking.");
      return;
    }
    setBookingStatus("loading");

    const payload = {
      spotId: spotIdToBook,
      userEmail: user?.email,
      name: formData.name,
      vehicle: formData.vehicle,
      payment: formData.payment,
    };

    try {
      const res = await secureFetch("spots/book", "POST", payload);
      if (res.error) throw new Error(res.error);
      setBookingStatus("success");
      alert(`Booking confirmed for ${spotIdToBook}!`);
      navigate("/dashboard");
    } catch (err: any) {
      alert(`Booking failed: ${err.message}`);
      setBookingStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="w-full bg-green-700 h-[86px] flex items-center px-10" />
      <button onClick={() => navigate("/book")} className="absolute top-8 left-6 w-[66px] h-[65px] bg-white rounded-full flex items-center justify-center shadow-md">
        <ArrowLeft className="w-8 h-8 text-black" />
      </button>

      <main className="flex flex-col md:flex-row p-4 gap-6 flex-1">
        {/* Grid Section */}
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">{spot?.toUpperCase()} Parking Lot</h2>
          <div className="grid grid-cols-6 gap-3 justify-items-center">
            {parkingSpots.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSpotClick(s.id)}
                disabled={s.status !== "available"}
                className={`w-16 h-20 rounded-lg flex flex-col justify-center items-center font-bold text-white ${
                  selectedSpot === s.id ? "bg-blue-600 ring-2 ring-blue-800" :
                  s.status === "booked" ? "bg-red-500" :
                  s.status === "inBooking" ? "bg-yellow-500" : "bg-green-600"
                }`}
              >
                {s.id}
              </button>
            ))}
          </div>
        </div>

        {/* Booking Form */}
        <div className="flex-1 max-w-md bg-white p-6 rounded-2xl shadow-lg border-t-4 border-green-600">
          <h2 className="text-2xl font-bold mb-6">Confirm Spot: {spotIdToBook}</h2>

          <div className="space-y-4">
            <input className="w-full border p-2 rounded" disabled value={formData.name} />
            <input className="w-full border p-2 rounded bg-gray-100" disabled value={formData.email} />
            <select
              value={formData.vehicle}
              onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
              className="w-full border p-2 rounded"
            >
              <option>Car</option>
              <option>Bike</option>
              <option>Scooter</option>
            </select>
            <select
              value={formData.payment}
              onChange={(e) => setFormData({ ...formData, payment: e.target.value })}
              className="w-full border p-2 rounded"
            >
              <option>UPI</option>
              <option>Card</option>
              <option>Cash</option>
            </select>

            <button
              onClick={handleConfirm}
              disabled={bookingStatus === "loading"}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
            >
              {bookingStatus === "loading" ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
