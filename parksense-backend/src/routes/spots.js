import express from 'express';
import admin from 'firebase-admin';

const router = express.Router();

// Global variables provided by the environment
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// NOTE: db is NOT initialized here to prevent the "no-app" error. 
// It will be initialized inside the route handler, ensuring initFirebaseAdmin() has run.
let db = null; 

/**
 * @route GET /api/spots
 * @desc Get available parking spots.
 * @access Public (but secured via token validation)
 */
router.get('/', async (req, res) => {
    try {
        // --- LAZY INITIALIZATION FIX ---
        // Ensure db is initialized now that the Firebase app is guaranteed to exist.
        if (!db) {
            db = admin.firestore();
        }
        // -------------------------------

        // --- MANDATORY FIRESTORE PATH CONSTRUCTION ---
        // For public/shared data, the path is: /artifacts/{appId}/public/data/{collectionName}
        const collectionName = 'parking_spots'; 
        const spotsCollectionPath = `artifacts/${appId}/public/data/${collectionName}`;
        
        console.log(`[Firestore] Querying collection: ${spotsCollectionPath}`);

        // Get all documents from the specified collection
        const snapshot = await db.collection(spotsCollectionPath).get();
        
        // Map the results into the format the frontend expects: [{name: 'X', count: N}, ...]
        const spots = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // The frontend expects a 'name' (location) and 'count' (available slots)
            if (data.name && typeof data.count === 'number') {
                spots.push({
                    name: data.name,
                    count: data.count
                });
            }
        });

        console.log(`[Firestore] Found ${spots.length} spots.`);

        // Respond with the array of spots
        res.status(200).json({ data: spots });

    } catch (error) {
        console.error('Error fetching parking spots:', error.message);
        // Respond with a 500 error, but send an empty array to prevent client-side crash
        res.status(500).json({ error: 'Failed to fetch spots from database.', data: [] });
    }
});

export default router;
