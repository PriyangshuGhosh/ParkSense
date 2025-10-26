import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Renamed export function to BookSpot for clarity, matching the functionality
export default function BookSpot() {
  const navigate = useNavigate();

  const spots = [
    // Note: Since 'bg-spot-ict' is undefined here, we rely on the text color change for contrast.
    { id: "ict", label: "ICT", color: "bg-spot-ict" },
    { id: "krc", label: "KRC", color: "bg-spot-krc" },
    { id: "gimsr", label: "GIMSR", color: "bg-spot-gimsr" },
    { id: "cb", label: "CB", color: "bg-spot-cb" },
    { id: "vb", label: "VB", color: "bg-spot-vb" },
  ];

  const handleSpotClick = (spotId: string) => {
    navigate(`/parking/${spotId}`);
  };

  const handleBack = () => {
    navigate("/dashboard");
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

      {/* Main Content: Ensure Centering */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 relative">
        {/* Back Button - Adjusted positioning for better responsive anchor */}
        <button
          onClick={handleBack}
          // Added sm:left-10 for better positioning on tablets/desktops
          className="absolute top-8 left-6 sm:left-10 w-[66px] h-[65px] bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow z-10"
          aria-label="Go back"
        >
          <ArrowLeft className="w-8 h-8 text-black" strokeWidth={1.5} />
        </button>

        {/* Card: FIXED SCATTERED CONTENT by adding mx-auto and my-auto */}
        <div className="bg-white rounded-[80px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-8 sm:p-12 md:p-16 w-full max-w-[653px] mx-auto my-auto">
          <div className="flex flex-col items-center">
            {/* Title */}
            <h1 className="text-[32px] font-normal text-black mb-10 text-center">
              Select a Spot
            </h1>

            {/* Spot Buttons - Adjusted max width for better appearance */}
            <div className="flex flex-col gap-6 w-full max-w-[300px] sm:max-w-[400px]">
              {spots.map((spot) => (
                <button
                  key={spot.id}
                  onClick={() => handleSpotClick(spot.id)}
                  // FIXED COLOR: Changed from text-white to text-black for visibility
                  className={`${spot.color} h-[73px] flex items-center justify-center text-black text-[48px] font-normal hover:opacity-90 transition-opacity`}
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
