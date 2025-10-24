// server/middleware/auth.js
import { getAuth } from 'firebase/auth';
import { auth } from '../../firebase/firebase.js';
const { admin } = require('../../firebase/admin');

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
}

async function authenticate(req, res, next) {
    try {
        const header = req.headers.authorization || req.headers.Authorization;
        if (!header || !header.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Missing or invalid Authorization header' });
        }
        const idToken = header.split(' ')[1];

        const decoded = await admin.auth().verifyIdToken(idToken);
        req.user = decoded; // decoded.uid contains the user id
        return next();
    } catch (err) {
        console.error('Auth verification failed:', err && err.message ? err.message : err);
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

module.exports = { authenticate };