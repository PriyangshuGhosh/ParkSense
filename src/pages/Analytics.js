import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firebase';
import { db } from '../firebase/firebase';

const Analytics = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    revenue: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
      const bookings = bookingsSnapshot.docs.map(doc => doc.data());
      
      setStats({
        totalBookings: bookings.length,
        activeBookings: bookings.filter(b => b.status === 'active').length,
        revenue: bookings.reduce((acc, curr) => acc + (curr.duration * 10), 0)
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="analytics">
      <h1>Analytics Dashboard</h1>
      <div className="stats">
        <div className="stat-card">
          <h3>Total Bookings</h3>
          <p>{stats.totalBookings}</p>
        </div>
        <div className="stat-card">
          <h3>Active Bookings</h3>
          <p>{stats.activeBookings}</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p>${stats.revenue}</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;