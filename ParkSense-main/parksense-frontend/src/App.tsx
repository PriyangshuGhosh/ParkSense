import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// CRITICAL IMPORT
// @
import { AuthProvider } from "./auth/AuthProvider"; 

// Import all pages using their clearer names
import Login from "./pages/Login"; // Renamed import from 'Index' to 'Login'
import Dashboard from "./pages/Dashboard";
import BookSpot from "./pages/BookSpot";
import ParkingGrid from "./pages/ParkingGrid";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* 🛑 WRAPPER: AuthProvider must be here to provide context */}
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Using the Login component for the root path */}
            <Route path="/" element={<Login />} /> 
            <Route path="/login" element={<Login />} />
            
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/book" element={<BookSpot />} />
            <Route path="/parking/:spot" element={<ParkingGrid />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
