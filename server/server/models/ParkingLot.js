// server/models/ParkingLot.js
import { db } from '../../firebase/firebase.js';
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';

const COLLECTION_NAME = 'parkingLots';

class ParkingLot {
    static async create(lotData) {
        const lotRef = doc(db, COLLECTION_NAME, lotData.name.toLowerCase());
        const data = {
            name: lotData.name,
            totalSpots: lotData.totalSpots,
            availableSpots: lotData.availableSpots || lotData.totalSpots,
            displayColor: lotData.displayColor || 'bg-spot-red',
            createdAt: new Date()
        };
        await setDoc(lotRef, data);
        return { id: lotData.name.toLowerCase(), ...data };
    }

    static async getById(lotId) {
        const lotRef = doc(db, COLLECTION_NAME, lotId.toLowerCase());
        const lotDoc = await getDoc(lotRef);
        if (!lotDoc.exists()) return null;
        return { id: lotDoc.id, ...lotDoc.data() };
    }

    static async getAll() {
        const lotsSnapshot = await getDocs(collection(db, COLLECTION_NAME));
        return lotsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    static async update(lotId, updateData) {
        const lotRef = doc(db, COLLECTION_NAME, lotId.toLowerCase());
        await updateDoc(lotRef, updateData);
        return { id: lotId.toLowerCase(), ...updateData };
    }

    static async updateAvailableSpots(lotId, availableSpots) {
        return this.update(lotId, { availableSpots });
    }

    static async delete(lotId) {
        const lotRef = doc(db, COLLECTION_NAME, lotId.toLowerCase());
        await deleteDoc(lotRef);
        return true;
    }
}

export default ParkingLot;