// src/pages/Dashboard.tsx
// @ts-ignore
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider'; 
import { useSecureApi } from '../api/api'; 
import { ArrowRight, Clock, MapPin, XCircle } from 'lucide-react';

interface ParkingSpot {
  id: string; // lowercase Firestore doc ID (ict, cb, vb, etc.)
  name: string;
  count: number;
  color: string;
}

interface Booking {
  spotId: string;
  userEmail: string;
  userName: string;
  vehicle: string;
  payment: string;
  bookedAt: string;
  expiryTime: string; // ISO string
}

const announcements = [
  "Parking Policy Update: All spots require online booking starting Nov 1st.",
  "ICT Block maintenance scheduled for Monday, 9 AM - 1 PM. Reduced spots available.",
  "Welcome to ParkSense! Enjoy seamless smart parking.",
];

const formatExpiry = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { secureFetch } = useSecureApi();

  const [dataLoading, setDataLoading] = useState(true);
  const [spotLoading, setSpotLoading] = useState(true);
  const [availableSpots, setAvailableSpots] = useState<ParkingSpot[]>([]);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ---- Fetch available spots ----
  const fetchAvailableSpots = async () => {
    setDataLoading(true);
    try {
      const data = await secureFetch('spots');
      if (data.error) throw new Error(data.error);

      const spotsWithColor: ParkingSpot[] = data.data.map((spot: any) => {
        const id = (spot.id || '').toLowerCase();
        let color = 'bg-indigo-600';
        if (id === 'ict') color = 'bg-blue-600';
        else if (id === 'cb') color = 'bg-orange-600';
        else if (id === 'krc') color = 'bg-green-600';
        else if (id === 'gimsr') color = 'bg-pink-600';
        else if (id === 'vb') color = 'bg-yellow-600';
        return { ...spot, id, color };
      });

      setAvailableSpots(spotsWithColor);
      setFetchError(null);
    } catch (error: any) {
      console.error("Error fetching available spots:", error.message);
      setFetchError(`Failed to fetch spots: ${error.message}`);
      setAvailableSpots([]);
    } finally {
      setDataLoading(false);
    }
  };

  // ---- Fetch current booking ----
  const fetchCurrentSpot = async () => {
    setSpotLoading(true);
    try {
      const data = await secureFetch('spots/my-spot');
      if (data.error) throw new Error(data.error);
      setCurrentBooking(data.booking || null);
    } catch (error: any) {
      console.error("Error fetching booking:", error.message);
      setCurrentBooking(null);
    } finally {
      setSpotLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchAvailableSpots();
      fetchCurrentSpot();
    }
  }, [authLoading]);

  // ---- Manage Booking (Extend / Abandon) ----
const handleSpotManagement = async (action: 'extend' | 'abandon') => {
  if (!currentBooking) return;
  if (action === 'abandon' && !window.confirm("Are you sure you want to abandon your spot?")) return;

  setSpotLoading(true);

  try {
    console.log(`[ACTION] Sending ${action.toUpperCase()} request for`, user?.email);

    const response = await secureFetch('spots/manage', 'PUT', {
      action,
      userEmail: user?.email,
    });

    console.log(`[RESPONSE]`, response);

    if (response.error) throw new Error(response.error);

    if (action === 'abandon') {
      setCurrentBooking(null);
      alert("Spot successfully abandoned!");
    } else {
      setCurrentBooking(response.newBooking);
      alert("Spot extended for 24 hours!");
    }

    fetchAvailableSpots(); // refresh spot counts
  } catch (error: any) {
    console.error(`[ERROR] Failed to ${action}:`, error.message);
    alert(`Action failed: ${error.message || 'Server error.'}`);
  } finally {
    setSpotLoading(false);
  }
};

  const handleBookSpot = () => navigate("/book");
  const handleLogout = async () => { await signOut(); navigate("/"); };
  const handleNavigateToGrid = (spotId: string) => navigate(`/parking/${spotId.toLowerCase()}`);

  return (
    <div className="min-h-screen bg-dashboard-gray">
      {/* Header */}
      <header className="h-[86px] bg-green-700 flex items-center px-6 md:px-10 gap-4">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/a4a60b90a144ebbeee72a3e84ed638fb4d7c16ef?width=410"
          alt="GITAM Logo"
          className="h-[60px] w-auto"
        />
        <div className="h-12 w-px bg-white/30"></div>
        <span className="text-white font-inter text-2xl md:text-3xl font-semibold">ParkSense</span>
      </header>

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full lg:w-[211px] bg-white lg:min-h-[calc(100vh-86px)] p-4 lg:p-0">
          <div className="flex flex-col items-center lg:mt-10 space-y-4 lg:space-y-6">
            <div className="w-32 h-32 lg:w-[181px] lg:h-[175px] rounded-full bg-gray-300 flex items-center justify-center text-4xl text-white font-bold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <p className="text-gray-900 font-bold text-lg text-center">{user?.displayName || user?.email || 'Guest User'}</p>

            <nav className="w-full lg:mt-8 space-y-4 px-4 lg:px-0">
              <button onClick={handleBookSpot} className="w-full h-14 border-2 border-black bg-white text-black text-xl hover:bg-gray-50">Book a Spot</button>
              <button onClick={() => navigate('/about')} className="w-full h-14 border-2 border-black bg-white text-black text-xl hover:bg-gray-50">About Us</button>
              <button onClick={handleLogout} className="w-full h-14 border-2 border-red-500 bg-red-500 text-white text-xl hover:bg-red-600">Logout</button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Announcements */}
            <section className="lg:col-span-1 bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="text-2xl font-bold mb-4 text-green-700">📢 Announcements</h2>
              {announcements.map((a, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded-lg border-l-4 border-yellow-500 mb-3">
                  <ArrowRight className="w-4 h-4 inline mr-2 text-yellow-600" />
                  {a}
                </div>
              ))}
            </section>

            {/* My Spot */}
            <section className="lg:col-span-2 bg-white rounded-2xl p-4 shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-blue-900">🅿️ My Spot</h2>
              {spotLoading ? (
                <p className="text-center text-gray-500">Loading your current spot...</p>
              ) : currentBooking ? (
                <div className="p-4 border border-blue-200 rounded-xl bg-blue-50 space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-3xl font-bold text-blue-800 flex items-center">
                      <MapPin className="w-6 h-6 mr-2" /> {currentBooking.spotId}
                    </h3>
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">Active</span>
                  </div>
                  <p>Vehicle: {currentBooking.vehicle}</p>
                  <p><Clock className="w-4 h-4 inline mr-1 text-red-500" /> Expires: <span className="text-red-600 font-semibold">{formatExpiry(currentBooking.expiryTime)}</span></p>

                  <div className="flex gap-4 mt-3">
                    <button onClick={() => handleSpotManagement('extend')} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg">Extend (+24h)</button>
                    <button onClick={() => handleSpotManagement('abandon')} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg flex items-center justify-center"><XCircle className="w-5 h-5 mr-1" /> Abandon</button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-3 italic">You do not have an active parking spot.</p>
                  <button onClick={handleBookSpot} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg">Book Your Spot</button>
                </div>
              )}
            </section>

            {/* Available Spots */}
            <section className="lg:col-span-3 bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Available Parking Spots</h2>
              <div className="flex flex-wrap gap-4">
                {dataLoading ? (
                  <p className="text-gray-500 italic">Loading spots...</p>
                ) : fetchError ? (
                  <p className="text-red-500 italic">{fetchError}</p>
                ) : (
                  availableSpots.map((spot) => (
                    <button key={spot.id} onClick={() => handleNavigateToGrid(spot.id)} className={`w-[200px] h-[80px] ${spot.color} rounded-xl flex items-center justify-between px-6 text-white text-2xl`}>
                      <span>{spot.name}</span>
                      <span>{spot.count}</span>
                    </button>
                  ))
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
