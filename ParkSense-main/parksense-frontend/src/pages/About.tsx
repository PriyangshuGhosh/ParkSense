import { useNavigate } from 'react-router-dom';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="h-20 bg-green-700 flex items-center px-6 md:px-10 gap-4">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/a4a60b90a144ebbeee72a3e84ed638fb4d7c16ef?width=410"
          alt="GITAM Logo"
          className="h-[60px] w-auto"
        />
        <div className="h-12 w-px bg-white/30"></div>
        <span className="text-white text-2xl md:text-3xl font-semibold">
          ParkSense
        </span>
      </header>

      <div className="flex flex-col lg:flex-row">
        <aside className="w-full lg:w-[211px] bg-white lg:min-h-[calc(100vh-86px)] p-4 lg:p-0">
          <div className="flex flex-col items-center lg:mt-10 space-y-4 lg:space-y-6">
            <div className="w-32 h-32 lg:w-[181px] lg:h-[175px] rounded-full bg-gray-300"></div>

            <nav className="w-full lg:w-[185px] space-y-3 lg:space-y-4 lg:px-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full h-14 border-2 border-black bg-white text-black font-inter text-xl lg:text-2xl hover:bg-gray-50 transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => navigate('/book')}
                className="w-full h-14 border-2 border-black bg-white text-black font-inter text-xl lg:text-2xl hover:bg-gray-50 transition-colors"
              >
                Book a Spot
              </button>
              <button
                className="w-full h-14 border-2 border-black bg-gray-200 text-black font-inter text-xl lg:text-2xl font-bold"
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

        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-md">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              About ParkSense
            </h1>
            
            <div className="space-y-4 text-gray-700">
              <p className="text-lg">
                Welcome to GITAM ParkSense - your smart parking solution.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-900 mt-6">Our Mission</h2>
              <p>
                To provide efficient and convenient parking management for GITAM campus community members.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-900 mt-6">Features</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Real-time parking spot availability</li>
                <li>Easy online booking system</li>
                <li>Multiple parking locations across campus</li>
                <li>Secure payment options</li>
                <li>24/7 access to your parking information</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-6">Contact Us</h2>
              <p>
                For support or inquiries, please contact the GITAM administration office.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}