import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ParkingSpot {
  name: string;
  count: number;
  color: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  // State for data fetched from API
  const [currentSpot, setCurrentSpot] = useState<{ location: string; expiryDate: string; bookingId: string } | null>(null);
  const [availableSpots, setAvailableSpots] = useState<ParkingSpot[]>([]);
  
  useEffect(() => {
    // TODO: Fetch data from GET /api/dashboard/summary
    // This is placeholder data mimicking the backend response structure
    setCurrentSpot({
        location: 'ICT - 12B',
        expiryDate: '28/12/2025',
        bookingId: 'mock-booking-123'
    });
    setAvailableSpots([
        { name: 'ICT', count: 12, color: 'bg-spot-red' },
        { name: 'KRC', count: 7, color: 'bg-spot-blue' },
        { name: 'GIMSR', count: 11, color: 'bg-spot-gold' },
        { name: 'CB', count: 11, color: 'bg-spot-purple' },
        { name: 'VB', count: 10, color: 'bg-spot-teal' },
    ]);
  }, []);

  const handleExtend = () => {
      // TODO: Call POST /api/booking/extend/:bookingId
      console.log("Extend Spot clicked for:", currentSpot?.location);
  }

  const handleAbandon = () => {
      // TODO: Call POST /api/booking/abandon/:bookingId
      console.log("Abandon Spot clicked for:", currentSpot?.location);
  }

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <section className="bg-white rounded-2xl p-4 lg:p-5 shadow-sm">
              <h2 className="font-instrument text-2xl font-bold mb-4 text-shadow">
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
                    <button 
                        onClick={handleExtend}
                        className="bg-spot-green text-white font-karma text-base font-bold px-6 py-3 rounded-[11px] hover:bg-opacity-90 transition-all tracking-wider">
                      Extend Spot
                    </button>
                    <button 
                        onClick={handleAbandon}
                        className="bg-spot-green text-white font-karma text-base font-bold px-6 py-3 rounded-[11px] hover:bg-opacity-90 transition-all tracking-wider">
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
                <h2 className="font-instrument text-2xl font-bold text-shadow">
                  Announcements
                </h2>
              </div>
              <div className="min-h-[140px]"></div> {/* TODO: Display announcement data */}
            </section>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <section className="bg-white rounded-2xl p-4 lg:p-5 shadow-sm">
              <h2 className="font-instrument text-2xl font-bold mb-4 text-shadow">
                Available Spot
              </h2>
              <div className="space-y-3 lg:space-y-4">
                {availableSpots.map((spot) => (
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
                ))}
              </div>
            </section>

            <section className="bg-white rounded-2xl p-4 lg:p-5 shadow-sm">
              <h2 className="font-instrument text-2xl font-bold mb-4 text-shadow">
                My Spot
              </h2>
              <div className="min-h-[300px]"></div> {/* TODO: Display historical/profile spot data */}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}