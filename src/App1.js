import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import your pages/components
import Home from './pages/Home';
import Booking from './pages/Booking';
import Analytics from './pages/Analytics';
import SlotList from './components/SlotList';
import BookingForm from './components/BookingForm';

// Import CSS (optional)
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Home Page */}
          <Route path="/" element={<Home />} />

          {/* Booking Page */}
          <Route path="/booking" element={<Booking />} />

          {/* Analytics Page */}
          <Route path="/analytics" element={<Analytics />} />

          {/* Slots List Page */}
          <Route path="/slots" element={<SlotList />} />

          {/* Booking Form Page */}
          <Route path="/book-slot" element={<BookingForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;