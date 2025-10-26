import express from 'express';
import admin from 'firebase-admin';

const router = express.Router();

// Global variables provided by the environment
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// NOTE: db is NOT initialized here to prevent the "no-app" error during server startup.
let db = null; 

/**
 * @route GET /api/spots
 * @desc Get available parking spots.
 * @access Public (but secured via token validation)
 */
router.get('/', async (req, res) => {
    try {
        // --- CRITICAL FIX: Explicit Firestore Client Initialization ---
        // We ensure 'db' is derived from the primary, initialized Firebase app instance,
        // which guarantees it uses the credentials loaded in src/firebaseAdmin.js (with the Editor role).
        if (!db) {
            db = admin.app().firestore(); 
        }
        // -------------------------------------------------------------

        // --- MANDATORY FIRESTORE PATH CONSTRUCTION ---
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

        console.log(`[Firestore] Found ${spots.length} spots. Connection successful.`);

        // Respond with the array of spots
        res.status(200).json({ data: spots });

    } catch (error) {
        console.error('Error fetching parking spots:', error.message);
        // Log the error detail for debugging
        console.error('Full Firestore Error:', error); 
        // Respond with a 500 error, but send an empty array to prevent client-side crash
        res.status(500).json({ error: 'Failed to fetch spots from database.', data: [] });
    }
});

export default router;
