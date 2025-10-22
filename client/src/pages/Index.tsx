import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Index() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { userId, password });
    
    // TODO: Connect to POST /api/auth/login here
    // On success: Store JWT token, then navigate.
    navigate('/dashboard'); 
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="p-6 md:p-10">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/41b1099362228c131fb58ab2a9ed096a0294ee04?width=358"
          alt="GITAM Logo"
          className="h-16 md:h-20 w-auto"
        />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-20">
        <form onSubmit={handleSubmit} className="w-full max-w-[601px]">
          <div className="relative w-full aspect-square max-w-[601px] mx-auto">
            <div className="absolute inset-0 rounded-[20%] border border-parksense-border bg-white flex flex-col items-center justify-center px-8 md:px-20 py-8 md:py-12">
              <h1 className="text-parksense-title font-frank text-4xl md:text-5xl lg:text-[48px] font-medium mb-12 md:mb-16 lg:mb-20">
                ParkSense
              </h1>
              
              <div className="w-full max-w-[366px] space-y-8 md:space-y-12 lg:space-y-16">
                <div className="relative">
                  <label
                    htmlFor="userId"
                    className="block text-center text-parksense-gray font-fustat text-lg md:text-2xl font-medium mb-2"
                  >
                    User ID
                  </label>
                  <input
                    type="text"
                    id="userId"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="w-full bg-transparent border-b border-parksense-gray text-center text-parksense-gray font-fustat text-lg md:text-2xl outline-none focus:border-parksense-title transition-colors pb-1"
                  />
                </div>

                <div className="relative">
                  <label
                    htmlFor="password"
                    className="block text-center text-parksense-gray font-fustat text-lg md:text-2xl font-medium mb-2"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent border-b border-parksense-gray text-center text-parksense-gray font-fustat text-lg md:text-2xl outline-none focus:border-parksense-title transition-colors pb-1"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-8 md:mt-12 lg:mt-16 bg-parksense-button text-black font-frank text-xl md:text-2xl font-medium px-10 py-2.5 hover:bg-opacity-90 transition-all"
              >
                Login
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}