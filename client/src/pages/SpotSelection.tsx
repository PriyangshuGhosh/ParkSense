import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface ParkingLot {
    id: string;
    label: string;
    color: string;
}

export default function SpotSelection() {
  const navigate = useNavigate();
  const [spots, setSpots] = useState<ParkingLot[]>([
    { id: "ict", label: "ICT", color: "bg-spot-ict" },
    { id: "krc", label: "KRC", color: "bg-spot-krc" },
    { id: "gimsr", label: "GIMSR", color: "bg-spot-gimsr" },
    { id: "cb", label: "CB", color: "bg-spot-cb" },
    { id: "vb", label: "VB", color: "bg-spot-vb" },
  ]);

  useEffect(() => {
    // TODO: Fetch lots from GET /api/parking/lots 
    // This populates the buttons with lot names and colors.
  }, []);

  const handleSpotClick = (spotId: string) => {
    navigate(`/parking/${spotId}`);
  };

  const handleBack = () => {
    navigate('/dashboard'); // Changed to go back to dashboard
  };

  return (
    <div className="min-h-screen flex flex-col bg-gitam-gray">
      {/* Header */}
      <header className="w-full bg-gitam-green h-[86px] flex items-center px-10">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/a4a60b90a144ebbeee72a3e84ed638fb4d7c16ef?width=410"
          alt="GITAM CATS Logo"
          className="h-[60px] w-auto"
        />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 relative">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="absolute top-8 left-6 w-[66px] h-[65px] bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
          aria-label="Go back"
        >
          <ArrowLeft className="w-8 h-8 text-black" strokeWidth={1.5} />
        </button>

        {/* Card */}
        <div className="bg-white rounded-[80px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-8 sm:p-12 md:p-16 w-full max-w-[653px]">
          <div className="flex flex-col items-center">
            {/* Title */}
            <h1 className="text-[32px] font-normal text-black mb-10 text-center">
              Select a Spot
            </h1>

            {/* Spot Buttons */}
            <div className="flex flex-col gap-6 w-full max-w-[200px]">
              {spots.map((spot) => (
                <button
                  key={spot.id}
                  onClick={() => handleSpotClick(spot.id)}
                  className={`${spot.color} h-[73px] flex items-center justify-center text-white text-[48px] font-normal hover:opacity-90 transition-opacity`}
                >
                  {spot.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}