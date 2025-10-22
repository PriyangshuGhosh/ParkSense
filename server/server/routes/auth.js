// server/routes/auth.js
import express from 'express';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import User from '../models/User.js';

const router = express.Router();
const auth = getAuth();

// @route POST /api/auth/register
// @desc Register a new user
router.post('/register', async (req, res) => {
    const { email, password, name, role = 'student' } = req.body;
    
    try {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const { user: firebaseUser } = userCredential;

        // Create user in Firestore
        const userData = {
            userId: firebaseUser.uid,
            email: firebaseUser.email,
            name,
            role
        };
        
        await User.create(userData);

        // Get ID token
        const idToken = await firebaseUser.getIdToken();

        res.status(201).json({
            token: idToken,
            user: { userId: firebaseUser.uid, name, email }
        });
    } catch (err) {
        console.error('Registration error:', err.message);
        res.status(500).json({ message: 'Error creating user' });
    }
});

// @route POST /api/auth/login
// @desc Authenticate user & get token (Frontend: Index.tsx)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // Sign in with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const { user: firebaseUser } = userCredential;

        // Get user data from Firestore
        const userData = await User.getById(firebaseUser.uid);
        if (!userData) {
            await firebaseUser.delete();
            return res.status(404).json({ message: 'User data not found' });
        }

        // Get ID token
        const idToken = await firebaseUser.getIdToken();

        res.json({
            token: idToken,
            user: {
                userId: userData.id,
                name: userData.name,
                email: userData.email,
                role: userData.role
            }
        });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

export default router;