// server/models/Booking.js
import { db } from '../../firebase/firebase.js';
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';

const COLLECTION_NAME = 'bookings';

class Booking {
    static async create(bookingData) {
        const bookingRef = doc(db, COLLECTION_NAME);
        const data = {
            ...bookingData,
            createdAt: new Date(),
            status: bookingData.status || 'active'
        };
        await setDoc(bookingRef, data);
        return { id: bookingRef.id, ...data };
    }

    static async getById(bookingId) {
        const bookingRef = doc(db, COLLECTION_NAME, bookingId);
        const bookingDoc = await getDoc(bookingRef);
        if (!bookingDoc.exists()) return null;
        return { id: bookingDoc.id, ...bookingDoc.data() };
    }

    static async getByUser(userId) {
        const q = query(collection(db, COLLECTION_NAME), where("user", "==", userId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    static async getActiveBookings() {
        const q = query(collection(db, COLLECTION_NAME), where("status", "==", "active"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    static async update(bookingId, updateData) {
        const bookingRef = doc(db, COLLECTION_NAME, bookingId);
        await updateDoc(bookingRef, updateData);
        return { id: bookingId, ...updateData };
    }

    static async updateStatus(bookingId, status) {
        return this.update(bookingId, { status });
    }

    static async delete(bookingId) {
        const bookingRef = doc(db, COLLECTION_NAME, bookingId);
        await deleteDoc(bookingRef);
        return true;
    }

    static async extendBooking(bookingId, additionalHours) {
        const booking = await this.getById(bookingId);
        if (!booking) throw new Error('Booking not found');

        const currentExpiry = booking.expiryTime.toDate();
        const newExpiryTime = new Date(currentExpiry.getTime() + additionalHours * 60 * 60 * 1000);
        
        return this.update(bookingId, { expiryTime: newExpiryTime });
    }
}

export default Booking;

// This file originally included unrelated Express route code at the bottom that broke imports.
// Keep only Firestore model helpers here.

const { db } = require('../../firebase/admin');

async function createBooking(bookingData) {
  const docRef = db.collection('bookings').doc();
  const payload = { ...bookingData, createdAt: new Date() };
  await docRef.set(payload);
  const doc = await docRef.get();
  return { id: doc.id, ...doc.data() };
}

async function getBooking(bookingId) {
  const doc = await db.collection('bookings').doc(bookingId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function updateBooking(bookingId, updates) {
  const ref = db.collection('bookings').doc(bookingId);
  await ref.update({ ...updates, updatedAt: new Date() });
  const doc = await ref.get();
  return { id: doc.id, ...doc.data() };
}

module.exports = { createBooking, getBooking, updateBooking };