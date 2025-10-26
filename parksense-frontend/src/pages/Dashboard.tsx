import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider'; 
import { useSecureApi } from '../api/api'; 

interface ParkingSpot {
  name: string;
  count: number;
  color: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { loading: authLoading } = useAuth(); // Renamed to authLoading for clarity
  const { secureFetch } = useSecureApi();
  
  // State for network loading status
  const [dataLoading, setDataLoading] = useState(true); 

  // Placeholder data for the current user's spot
  const [currentSpot] = useState({
    location: 'ICT - 12B',
    expiryDate: '28/12/2025',
  });

  // State to hold the data fetched from the backend
  const [availableSpots, setAvailableSpots] = useState<ParkingSpot[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  // Flag to ensure data is only fetched once
  const [hasFetched, setHasFetched] = useState(false);

  // 🚀 CRITICAL FIX: Fetch data only once after loading is complete
  useEffect(() => {
    // Only proceed if authentication is complete AND we haven't fetched yet
    if (!authLoading && !hasFetched) { 
      setDataLoading(true); // Start loading animation/indicator
      console.log("Dashboard mounted. Attempting secure fetch for spots..."); 

      secureFetch('spots') 
        .then(response => {
          // Map the backend data ({id, name, count}) to frontend structure.
          const mappedSpots: ParkingSpot[] = response.data.map((spot: any, index: number) => ({
              name: spot.name || 'Unknown',
              // FIX: Use spot.count from the backend, defaulting to 1 if it's not a valid number
              count: typeof spot.count === 'number' ? spot.count : 1, 
              // Simple color assignment for visual variety
              color: ['bg-spot-red', 'bg-spot-blue', 'bg-spot-gold', 'bg-spot-purple', 'bg-spot-teal'][index % 5] || 'bg-spot-red'
          }));
          setAvailableSpots(mappedSpots);
          setFetchError(null);
          setHasFetched(true); // Mark as fetched on success
          setDataLoading(false); // Stop loading
        })
        .catch(err => {
          console.error("Dashboard Fetch Failed:", err);
          setFetchError(err.message || "Failed to load spots.");
          setHasFetched(true); // Mark as fetched even on failure to stop continuous retries
          setDataLoading(false); // Stop loading
        });
    }
  }, [authLoading, secureFetch, hasFetched]); 

  return (
    <div className="min-h-screen bg-dashboard-gray">
      <header className="h-[86px] bg-gitam-green flex items-center px-6 md:px-10 gap-4">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/a4a60b90a144ebbeee72a3e84ed638fb4d7c16ef?width=410"
          alt="GITAM Logo"
          className="h-[60px] w-auto"
        />
        <div className="h-12 w-px bg-white/30"></div>
        <span className="text-white font-inter text-2xl md:text-3xl font-semibold">
          CATS
        </span>
      </header>

      <div className="flex flex-col lg:flex-row">
        <aside className="w-full lg:w-[211px] bg-white lg:min-h-[calc(100vh-86px)] p-4 lg:p-0">
          <div className="flex flex-col items-center lg:mt-10 space-y-4 lg:space-y-6">
            <div className="w-32 h-32 lg:w-[181px] lg:h-[175px] rounded-full bg-profile-gray"></div>

            <nav className="w-full lg:w-[185px] space-y-3 lg:space-y-4 lg:px-4">
              <button className="w-full h-14 border-2 border-black bg-white text-black font-inter text-xl lg:text-2xl hover:bg-gray-50 transition-colors">
                Home
              </button>
              <button
                onClick={() => navigate('/book')}
                className="w-full h-14 border-2 border-black bg-white text-black font-inter text-xl lg:text-2xl hover:bg-gray-50 transition-colors"
              >
                Book a Spot
              </button>
              <button
                onClick={() => navigate('/about')}
                className="w-full h-14 border-2 border-black bg-white text-black font-inter text-xl lg:text-2xl hover:bg-gray-50 transition-colors"
              >
                About us
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full h-14 border-2 border-black bg-white text-black font-inter text-xl lg:text-2xl hover:bg-gray-50 transition-colors"
              >
                Logout
              </button>
            </nav>
          </div>
        </aside>

        <main className="flex-1 p-4 lg:p-6 space-y-4 lg:space-y-6">
          {fetchError && ( 
            <div className="text-red-600 font-bold p-4 bg-red-100 rounded">
              Error: {fetchError} - Ensure you are logged in and the backend is running.
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <section className="bg-white rounded-2xl p-4 lg:p-5 shadow-sm">
              {/* FIX: Changed color to text-blue-900 for guaranteed visibility and distinct contrast */}
              <h2 className="font-instrument text-2xl font-bold mb-4 text-blue-900">
                Current Spot
              </h2>
              {currentSpot ? (
                <div className="space-y-4">
                  <div className="bg-spot-green rounded-[17px] shadow-lg p-4 max-w-[378px]">
                    <h3 className="font-instrument text-3xl lg:text-[48px] font-bold text-white tracking-wide leading-tight">
                      {currentSpot.location}
                    </h3>
                    <p className="font-karma text-base font-bold text-white tracking-wider mt-3">
                      Expire On :{currentSpot.expiryDate}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button className="bg-spot-green text-white font-karma text-base font-bold px-6 py-3 rounded-[11px] hover:bg-opacity-90 transition-all tracking-wider">
                      Extend Spot
                    </button>
                    <button className="bg-spot-green text-white font-karma text-base font-bold px-6 py-3 rounded-[11px] hover:bg-opacity-90 transition-all tracking-wider">
                      Abandon Spot
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-spot-placeholder italic text-xs text-center py-16">
                  You have no parking spot now, please book a spot
                </p>
              )}
            </section>

            <section className="bg-white rounded-2xl p-4 lg:p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/e8f487c7542a463ab231dcfa8fccc56aa6d81c4e?width=66"
                  alt="Notification"
                  className="w-8 h-8"
                />
                {/* FIX: Changed color to text-blue-900 for guaranteed visibility and distinct contrast */}
                <h2 className="font-instrument text-2xl font-bold text-blue-900">
                  Announcements
                </h2>
              </div>
              <div className="min-h-[140px]"></div>
            </section>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <section className="bg-white rounded-2xl p-4 lg:p-5 shadow-sm">
              {/* FIX: Changed color to text-blue-900 for guaranteed visibility and distinct contrast */}
              <h2 className="font-instrument text-2xl font-bold mb-4 text-blue-900">
                Available Spot
              </h2>
              <div className="space-y-3 lg:space-y-4">
                {dataLoading ? (
                    // Show a simple loading indicator
                    <div className="text-center py-8 text-gray-500 font-inter">Loading available spots...</div>
                ) : availableSpots.length > 0 ? (
                    availableSpots.map((spot) => (
                      <button
                        key={spot.name}
                        className={`w-full max-w-[351px] h-[74px] ${spot.color} rounded-[15px] flex items-center justify-between px-6 hover:opacity-90 transition-opacity`}
                      >
                        <span className="text-white font-inter text-3xl lg:text-[40px] italic">
                          {spot.name}
                        </span>
                        <span className="text-white font-inter text-3xl lg:text-[40px] italic">
                          {spot.count}
                        </span>
                      </button>
                    ))
                ) : (
                    // Message when data is fetched but the list is empty
                    <div className="text-center py-8 text-gray-500 font-inter italic">No available spots were found.</div>
                )}
              </div>
            </section>

            <section className="bg-white rounded-2xl p-4 lg:p-5 shadow-sm">
              {/* FIX: Changed color to text-blue-900 for guaranteed visibility and distinct contrast */}
              <h2 className="font-instrument text-2xl font-bold mb-4 text-blue-900">
                My Spot
              </h2>
              <div className="min-h-[300px]"></div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
