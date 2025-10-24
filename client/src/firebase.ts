import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBRFkw_HNQE6xg-D-jE-uutQM-OD-7s53Q",
  authDomain: "parksense-347f2.firebaseapp.com",
  projectId: "parksense-347f2",
  storageBucket: "parksense-347f2.firebasestorage.app",
  messagingSenderId: "760109710787",
  appId: "1:760109710787:web:146d0903a02e2ff8609176",
  measurementId: "G-K0DBQEN018"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;