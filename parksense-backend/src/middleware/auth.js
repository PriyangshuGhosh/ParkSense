// parksense-backend/src/middleware/auth.js

import initFirebaseAdmin from '../firebaseAdmin.js';
const admin = initFirebaseAdmin();

export async function verifyFirebaseIdToken(req, res, next){
    // 1. DELETE/COMMENT OUT THE DEV BYPASS HERE
    /*
    if (process.env.NODE_ENV !== 'production') {
        console.warn('!!! AUTH BYPASSED IN DEVELOPMENT !!!');
        return next();
    }
    */
    
    const authHeader = req.headers.authorization || '';
    const match = authHeader.match(/^Bearer (.+)$/);
    
    // Check for the token
    if (!match) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const idToken = match[1];

    // Verify the token
    try {
        // Core security step: Verifies token validity, expiration, and issuer
        const decoded = await admin.auth().verifyIdToken(idToken);
        req.user = decoded; // Attach user info to the request object
        next(); // Token is valid, proceed to the next middleware/route
    } catch (err) {
        console.error('Token verify error:', err.message);
        return res.status(401).json({ error: 'Invalid token' });
    }
}