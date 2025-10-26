import { useNavigate } from 'react-router-dom';

interface PlaceholderProps {
  pageName: string;
}

export default function Placeholder({ pageName }: PlaceholderProps) {
  const navigate = useNavigate();

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

        <main className="flex-1 flex items-center justify-center p-4 lg:p-6">
          <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md text-center">
            <h1 className="font-instrument text-3xl font-bold mb-4">
              {pageName}
            </h1>
            <p className="text-gray-600 mb-6">
              This page is under construction. Continue prompting to add content
              to this section.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gitam-green text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
