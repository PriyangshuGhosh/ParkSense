// server/middleware/auth.js
import { getAuth } from 'firebase/auth';
import { auth } from '../../firebase/firebase.js';

export default async function(req, res, next) {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Verify token with Firebase Auth
        const decodedToken = await auth.verifyIdToken(token);
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            role: decodedToken.role || 'student'
        };
        next();
    } catch (err) {
        console.error('Auth error:', err);
        res.status(401).json({ message: 'Invalid token' });
    }
};