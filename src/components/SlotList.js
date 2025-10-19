import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firebase';
import { db } from '../firebase/firebase';
import SlotCard from './SlotCard';

const SlotList = () => {
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'slots'), (snapshot) => {
      const slotsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSlots(slotsData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="slot-list">
      {slots.map(slot => (
        <SlotCard key={slot.id} slot={slot} />
      ))}
    </div>
  );
};

export default SlotList;
