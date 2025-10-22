import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();

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
      <main className="flex-1 p-4 sm:p-6 md:p-8 relative">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="absolute top-8 left-6 w-[66px] h-[65px] bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow z-10"
          aria-label="Go back"
        >
          <ArrowLeft className="w-8 h-8 text-black" strokeWidth={1.5} />
        </button>

        {/* Content Card */}
        <div className="max-w-[1197px] mx-auto mt-16 lg:mt-8">
          <div className="bg-white rounded-[77px] p-8 sm:p-12 lg:p-16">
            {/* Title */}
            <h1 className="text-[48px] sm:text-[64px] font-normal text-black leading-[110%] mb-8 sm:mb-12">
              About
            </h1>

            {/* Content */}
            <div className="text-[16px] sm:text-[20px] text-black leading-[110%] space-y-4">
              <p className="font-semibold">ParkSense: About Us</p>
              
              <p>
                Welcome to ParkSense – Your Intelligent Campus Parking Solution at GITAM!
              </p>
              
              <p>
                At ParkSense, we believe that finding a parking spot on campus shouldn't be a source of stress. Developed specifically for the GITAM community, our mission is to transform your daily parking experience from a challenge into a seamless, efficient, and intelligent process.
              </p>
              
              <p>
                Our Vision: To create a smarter, more sustainable campus environment where parking is effortlessly managed, reducing congestion and saving valuable time for students, faculty, and staff.
              </p>
              
              <p>
                What is ParkSense? ParkSense is a state-of-the-art parking management system designed to bring convenience and clarity to campus parking. Whether you're rushing to a lecture, heading to a meeting, or visiting the campus, ParkSense empowers you with real-time information and easy booking options right at your fingertips.
              </p>
              
              <p className="font-semibold">Key Features & Benefits:</p>
              
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <span className="font-semibold">Real-time Availability:</span> Instantly see which parking zones (like ICT, KRS, GIMSR) have available spots, helping you make informed decisions before you even arrive.
                </li>
                <li>
                  <span className="font-semibold">Effortless Booking & Management:</span> Secure your spot in advance or manage your active parking session with simple taps. Extend your time or abandon a spot with ease.
                </li>
                <li>
                  <span className="font-semibold">Intuitive Campus Map:</span> Our integrated map shows you exactly where parking zones are located, helping you navigate the campus more efficiently.
                </li>
                <li>
                  <span className="font-semibold">Personalized Experience:</span> Manage your registered vehicles, view your parking history, and stay updated on your monthly pass status and renewal dates.
                </li>
                <li>
                  <span className="font-semibold">Smart Planning:</span> Gain insights into parking trends and average occupancy, allowing you to plan your arrival for optimal convenience.
                </li>
                <li>
                  <span className="font-semibold">Eco-Friendly:</span> By reducing time spent circling for spots, ParkSense contributes to less fuel consumption and a greener campus.
                </li>
              </ul>
              
              <p>
                Our Commitment: We are committed to continuously enhancing ParkSense to meet the evolving needs of the GITAM community. Your feedback is invaluable in helping us refine the system and ensure it remains the most reliable and user-friendly parking solution on campus.
              </p>
              
              <p className="font-semibold">
                Thank you for choosing ParkSense. Park Smarter, Live Better!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}