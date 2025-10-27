// parksense-backend/src/middleware/auth.js

import initFirebaseAdmin from '../firebaseAdmin.js';

// ----------------------------------------------------------------------
// FIX: Lazy Initialization Setup for Firebase Admin
// ----------------------------------------------------------------------
let adminInstance = null;

/**
 * Safely initializes and returns the Firebase Admin instance.
 * @returns {admin.app.App | null} The Firebase Admin instance or null if initialization fails.
 */
function getAdmin() {
    // Attempt initialization only once
    if (!adminInstance) {
        try {
            // This call runs lazily when the middleware is first executed by a request,
            // which is guaranteed to be AFTER dotenv.config() in index.js.
            adminInstance = initFirebaseAdmin();
        } catch (e) {
            console.warn("Firebase Admin initialization failed during lazy load in auth middleware. Auth will be disabled.");
            adminInstance = null;
        }
    }
    return adminInstance;
}
// ----------------------------------------------------------------------


/**
 * Verifies the Firebase ID Token from the Authorization header.
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function verifyFirebaseIdToken(req, res, next){
    const admin = getAdmin();

    // Check if admin is initialized (Firestore mode)
    if (!admin) {
        console.warn('!!! AUTH DISABLED: Firebase Admin not initialized. Skipping token verification. !!!');
        if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
             return res.status(500).json({ error: 'Server configuration error: Authentication not available.' });
        }
        
        // --- DEV BYPASS ---
        // For local development when env vars might be tricky, add a mock user:
        if (process.env.NODE_ENV === 'development') {
            console.warn('!!! AUTH BYPASSED in development. Attaching mock user. !!!');
            req.user = { email: 'dev.user@example.com', uid: 'dev-uid-12345', displayName: 'Dev User' };
            return next();
        }
    }

    const authHeader = req.headers.authorization || '';
    const match = authHeader.match(/^Bearer (.+)$/);
    
    // Check for the token
    if (!match) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const idToken = match[1];

    // Verify the token
    try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        req.user = decoded; // Attach user info to the request object
        next(); 
    } catch (err) {
        console.error('Token verify error:', err.message);
        return res.status(401).json({ error: 'Invalid token' });
    }
}