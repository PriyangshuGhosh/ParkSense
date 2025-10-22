// server/models/ParkingSpot.js
import { db } from '../../firebase/firebase.js';
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';

const COLLECTION_NAME = 'parkingSpots';

class ParkingSpot {
    static async create(spotData) {
        const spotId = `${spotData.lotId}_${spotData.spotId}`;
        const spotRef = doc(db, COLLECTION_NAME, spotId);
        const data = {
            ...spotData,
            status: spotData.status || 'available',
            currentBooking: spotData.currentBooking || null,
            adjacentSpots: spotData.adjacentSpots || [],
            lastUpdateTime: new Date()
        };
        await setDoc(spotRef, data);
        return { id: spotId, ...data };
    }

    static async getById(lotId, spotId) {
        const id = `${lotId}_${spotId}`;
        const spotRef = doc(db, COLLECTION_NAME, id);
        const spotDoc = await getDoc(spotRef);
        if (!spotDoc.exists()) return null;
        return { id: spotDoc.id, ...spotDoc.data() };
    }

    static async getByLotId(lotId) {
        const q = query(collection(db, COLLECTION_NAME), where("lotId", "==", lotId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    static async update(lotId, spotId, updateData) {
        const id = `${lotId}_${spotId}`;
        const spotRef = doc(db, COLLECTION_NAME, id);
        const data = {
            ...updateData,
            lastUpdateTime: new Date()
        };
        await updateDoc(spotRef, data);
        return { id, ...data };
    }

    static async updateStatus(lotId, spotId, status, bookingId = null) {
        return this.update(lotId, spotId, {
            status,
            currentBooking: bookingId,
            lastUpdateTime: new Date()
        });
    }

    static async delete(lotId, spotId) {
        const id = `${lotId}_${spotId}`;
        const spotRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(spotRef);
        return true;
    }
}

export default ParkingSpot;