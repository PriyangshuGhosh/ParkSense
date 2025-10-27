import { getFirestoreInstance } from '../firebaseAdmin.js';
import admin from 'firebase-admin';

export async function clearExpiredBookings() {
  const db = getFirestoreInstance();
  const now = new Date();

  const bookings = await db.collection('public').doc('data').collection('user_bookings').get();
  for (const doc of bookings.docs) {
    const data = doc.data();
    const expiry = new Date(data.expiryTime);
    if (expiry < now) {
      const blockRef = db.collection('public').doc('data').collection('parking_spots').doc(data.blockId);
      await blockRef.update({ count: admin.firestore.FieldValue.increment(1) });
      await doc.ref.delete();
      console.log(`🧹 Cleared expired booking for ${data.userEmail}`);
    }
  }
}
