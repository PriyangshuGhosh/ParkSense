// server/models/User.js
import { db } from '../../firebase/firebase.js';
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';

const COLLECTION_NAME = 'users';

class User {
    static async create(userData) {
        const userRef = doc(db, COLLECTION_NAME, userData.userId);
        await setDoc(userRef, {
            ...userData,
            createdAt: new Date()
        });
        return userData;
    }

    static async getById(userId) {
        const userRef = doc(db, COLLECTION_NAME, userId);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) return null;
        return { id: userDoc.id, ...userDoc.data() };
    }

    static async update(userId, updateData) {
        const userRef = doc(db, COLLECTION_NAME, userId);
        await updateDoc(userRef, updateData);
        return { id: userId, ...updateData };
    }

    static async delete(userId) {
        const userRef = doc(db, COLLECTION_NAME, userId);
        await deleteDoc(userRef);
        return true;
    }

    static async findByRole(role) {
        const q = query(collection(db, COLLECTION_NAME), where("role", "==", role));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
}

export default User;