import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firebase';
import { db } from '../firebase/firebase';

const BookingForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    vehicleNumber: '',
    startTime: '',
    duration: 1
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'bookings'), {
        ...formData,
        timestamp: new Date(),
        status: 'active'
      });
      alert('Booking successful!');
      setFormData({ name: '', vehicleNumber: '', startTime: '', duration: 1 });
    } catch (error) {
      console.error('Error adding booking: ', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
      <input
        type="text"
        placeholder="Vehicle Number"
        value={formData.vehicleNumber}
        onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})}
      />
      <input
        type="datetime-local"
        value={formData.startTime}
        onChange={(e) => setFormData({...formData, startTime: e.target.value})}
      />
      <input
        type="number"
        placeholder="Duration (hours)"
        value={formData.duration}
        onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
      />
      <button type="submit">Book Slot</button>
    </form>
  );
};

export default BookingForm;