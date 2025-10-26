import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type SpotStatus = "available" | "booked" | "inBooking";

interface ParkingSpot {
  id: string;
  status: SpotStatus;
}

export default function ParkingGrid() {
  const navigate = useNavigate();
  const { spot } = useParams<{ spot: string }>();
  
  const spotNames: Record<string, string> = {
    ict: "ICT-Bavan",
    krc: "KRC-Bavan",
    gimsr: "GIMSR-Bavan",
    cb: "CB-Bavan",
    vb: "VB-Bavan",
  };

  const [selectedSpot, setSelectedSpot] = useState<string | null>("6 A");
  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "Xyx1244@xmail.com",
    vehicle: "Car",
    payment: "UPI",
  });

  // Initialize parking spots (6 columns x 3 rows)
  const [parkingSpots] = useState<ParkingSpot[]>([
    // Row A
    { id: "1 A", status: "available" },
    { id: "2 A", status: "available" },
    { id: "3 A", status: "available" },
    { id: "4 A", status: "available" },
    { id: "5 A", status: "inBooking" },
    { id: "6 A", status: "available" },
    // Row B
    { id: "1 B", status: "available" },
    { id: "2 B", status: "available" },
    { id: "3 B", status: "available" },
    { id: "4 B", status: "available" },
    { id: "5 B", status: "available" },
    { id: "6 B", status: "available" },
    // Row C
    { id: "1 C", status: "available" },
    { id: "2 C", status: "available" },
    { id: "3 C", status: "available" },
    { id: "4 C", status: "available" },
    { id: "5 C", status: "available" },
    { id: "6 C", status: "booked" },
  ]);

  const getSpotColor = (status: SpotStatus, isSelected: boolean) => {
    if (isSelected) return "bg-[#08933D]";
    if (status === "booked") return "bg-[#878787]";
    if (status === "inBooking") return "bg-[#3D9CE9]";
    return "bg-white";
  };

  const handleSpotClick = (spotId: string, status: SpotStatus) => {
    if (status === "available" || status === "inBooking") {
      setSelectedSpot(spotId);
    }
  };

  const handleConfirm = () => {
    console.log("Booking confirmed:", { ...formData, spot: selectedSpot });
  };

  const handleBack = () => {
    navigate("/Book");
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
      <main className="flex-1 p-4 sm:p-6 md:p-8 relative">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="absolute top-8 left-6 w-[66px] h-[65px] bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow z-10"
          aria-label="Go back"
        >
          <ArrowLeft className="w-8 h-8 text-black" strokeWidth={1.5} />
        </button>

        {/* Desktop Layout */}
        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-8 mt-16 lg:mt-8">
          {/* Left Side - Parking Grid */}
          <div className="flex-1">
            <div className="bg-white rounded-[48px] p-8 sm:p-12">
              {/* Title */}
              <h1 className="text-[32px] sm:text-[48px] font-normal text-black mb-6">
                {spotNames[spot || "ict"]} Parking Grid
              </h1>

              {/* Legend */}
              <div className="flex flex-col gap-3 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-[30px] h-[27px] rounded-full bg-[#878787] border border-black" />
                  <span className="text-base text-black">Means Booked</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-[30px] h-[27px] rounded-full bg-[#3D9CE9] border border-black" />
                  <span className="text-base text-black">
                    Means In Booking,Refresh to check
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-[30px] h-[27px] rounded-full bg-white border border-black" />
                  <span className="text-base text-black">Means Available</span>
                </div>
              </div>

              {/* Parking Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 sm:gap-6">
                {parkingSpots.map((spot) => {
                  const isSelected = selectedSpot === spot.id;
                  return (
                    <button
                      key={spot.id}
                      onClick={() => handleSpotClick(spot.id, spot.status)}
                      disabled={spot.status === "booked"}
                      className={`
                        aspect-[87/167] rounded-[36px] border border-black
                        flex items-center justify-center text-[24px] sm:text-[32px] font-normal
                        transition-all hover:scale-105
                        ${getSpotColor(spot.status, isSelected)}
                        ${spot.status === "booked" ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
                      `}
                    >
                      {spot.id}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Side - Booking Form */}
          <div className="w-full lg:w-[336px]">
            <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm">
              {/* Name */}
              <div className="mb-6">
                <label className="block text-base text-black mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full h-[38px] px-3 border border-black bg-white text-base rounded-none"
                />
              </div>

              {/* Email */}
              <div className="mb-6">
                <label className="block text-base text-black mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full h-[38px] px-3 border border-black bg-white text-base rounded-none"
                />
              </div>

              {/* Spot Number */}
              <div className="mb-6">
                <label className="block text-base text-black mb-2">
                  Spot Number
                </label>
                <input
                  type="text"
                  value={selectedSpot || ""}
                  readOnly
                  className="w-full h-[38px] px-3 border border-black bg-white text-base rounded-none"
                />
              </div>

              {/* Vehicle */}
              <div className="mb-6">
                <label className="block text-base text-[#1E1E1E] mb-2">
                  Vehicle
                </label>
                <div className="relative">
                  <select
                    value={formData.vehicle}
                    onChange={(e) =>
                      setFormData({ ...formData, vehicle: e.target.value })
                    }
                    className="w-full h-[40px] px-4 pr-10 border border-[#D9D9D9] bg-white text-base rounded-lg appearance-none"
                  >
                    <option>Car</option>
                    <option>Bike</option>
                    <option>Scooter</option>
                  </select>
                  <svg
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M4 6L8 10L12 6"
                      stroke="#1E1E1E"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Payment */}
              <div className="mb-8">
                <label className="block text-base text-[#1E1E1E] mb-2">
                  Payment
                </label>
                <div className="relative">
                  <select
                    value={formData.payment}
                    onChange={(e) =>
                      setFormData({ ...formData, payment: e.target.value })
                    }
                    className="w-full h-[40px] px-4 pr-10 border border-[#D9D9D9] bg-white text-base rounded-lg appearance-none"
                  >
                    <option>UPI</option>
                    <option>Card</option>
                    <option>Cash</option>
                  </select>
                  <svg
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M4 6L8 10L12 6"
                      stroke="#1E1E1E"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleConfirm}
                className="w-full h-[49px] bg-[#087D47] hover:bg-[#06663a] text-white text-[36px] font-normal rounded-[14px] transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}