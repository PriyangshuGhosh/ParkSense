import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home">
      <h1>Welcome to ParkSense</h1>
      <div className="nav-buttons">
        <Link to="/booking" className="nav-button">
          Book a Parking Slot
        </Link>
        <Link to="/analytics" className="nav-button">
          View Analytics
        </Link>
      </div>
    </div>
  );
};

export default Home;