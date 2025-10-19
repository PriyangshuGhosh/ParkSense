import React from 'react';
import BookingForm from '../components/BookingForm';
import SlotList from '../components/SlotList';

const Booking = () => {
  return (
    <div className="booking-page">
      <h1>Parking Slot Booking</h1>
      <BookingForm />
      <SlotList />
    </div>
  );
};

export default Booking;