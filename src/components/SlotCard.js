import React from 'react';

const SlotCard = ({ slot }) => {
  return (
    <div className="slot-card">
      <h3>Slot {slot.number}</h3>
      <p>Status: {slot.status}</p>
      {slot.occupied && (
        <>
          <p>Vehicle: {slot.vehicleNumber}</p>
          <p>Duration: {slot.duration} hours</p>
        </>
      )}
    </div>
  );
};

export default SlotCard;