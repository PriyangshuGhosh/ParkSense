// Import the functions you need from the Firebase SDKs
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firebase";

// Your web app's Firebase configuration
// (replace these with your actual Firebase project credentials)


const firebaseConfig = {
  apiKey: "AIzaSyBRFkw_HNQE6xg-D-jE-uutQM-OD-7s53Q",
  authDomain: "parksense-347f2.firebaseapp.com",
  projectId: "parksense-347f2",
  storageBucket: "parksense-347f2.firebasestorage.app",
  messagingSenderId: "760109710787",
  appId: "1:760109710787:web:146d0903a02e2ff8609176",
  measurementId: "G-K0DBQEN018"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Export Firestore database
export { db };
