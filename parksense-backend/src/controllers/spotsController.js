import initFirebaseAdmin from '../firebaseAdmin.js';
import fs from 'fs';
import path from 'path';
import { StatusCodes } from 'http-status-codes';

const admin = initFirebaseAdmin();
let db;
try { db = admin.firestore(); } catch(e){ db = null; }

const COLLECTION = 'parking_spots';
const FILE_STORE = path.resolve('./data/spots.json');

// --- INNOVATION: Sample Data for Development/File Store Mode ---
const INITIAL_SPOTS = [
    { id: 'ICT-1', name: 'ICT Block', count: 12, status: 'available' },
    { id: 'CSE-1', name: 'CSE Block', count: 5, status: 'available' },
    { id: 'ADMIN-1', name: 'Admin Gate', count: 2, status: 'available' },
    { id: 'FOOD-1', name: 'Food Court', count: 8, status: 'available' },
    { id: 'BUS-1', name: 'Bus Bay', count: 0, status: 'unavailable' },
];

function ensureFileStore(){
    const dir = path.dirname(FILE_STORE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive:true});
    // FIX: Initialize with sample data if the file doesn't exist
    if (!fs.existsSync(FILE_STORE)) fs.writeFileSync(FILE_STORE, JSON.stringify(INITIAL_SPOTS, null, 2));
}

// Helper to find spot index in local file store
function findSpotIndex(arr, id) {
    return arr.findIndex(d => d.id === id);
}

// Lists all spots (used by the secured /api/spots GET route)
export async function listSpots(req, res){
    try {
        if (db){
            const snapshot = await db.collection(COLLECTION).get();
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            return res.json({ data });
        } else {
            ensureFileStore();
            const data = JSON.parse(fs.readFileSync(FILE_STORE,'utf8'));
            // FIX: Filter spots for display: only include spots with count > 0 for dashboard view
            const displayData = data.filter(spot => spot.count > 0 || spot.status === 'available');
            
            // To match the frontend's expectation, we explicitly ensure name and count are present
            const finalData = displayData.map(spot => ({
                name: spot.name,
                count: spot.count,
                id: spot.id // Keep ID for potential future use
            }));
            
            return res.json({ data: finalData });
        }
    } catch (err){
        console.error(err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Unable to list spots' });
    }
}

// Creates a new spot
export async function createSpot(req, res){
// ... (createSpot function remains unchanged)
    try {
        const payload = req.body;
        if (!payload || !payload.name) return res.status(StatusCodes.BAD_REQUEST).json({ error: 'name required' });
        if (db){
            const docRef = await db.collection(COLLECTION).add({ ...payload, createdAt: new Date() });
            const doc = await docRef.get();
            return res.status(StatusCodes.CREATED).json({ id: docRef.id, data: doc.data() });
        } else {
            ensureFileStore();
            const arr = JSON.parse(fs.readFileSync(FILE_STORE,'utf8'));
            const id = String(Date.now());
            // Ensure new spots created in dev mode also have a count, default to 10
            const count = typeof payload.count === 'number' ? payload.count : 10;
            const item = { id, ...payload, count, createdAt: new Date().toISOString() }; 
            arr.push(item);
            fs.writeFileSync(FILE_STORE, JSON.stringify(arr,null,2));
            return res.status(StatusCodes.CREATED).json({ id, data: item });
        }
    } catch (err){
        console.error(err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Unable to create spot' });
    }
}

// Gets a single spot
export async function getSpot(req, res){
// ... (getSpot function remains unchanged)
    try {
        const id = req.params.id;
        if (db){
            const doc = await db.collection(COLLECTION).doc(id).get();
            if (!doc.exists) return res.status(StatusCodes.NOT_FOUND).json({ error: 'Not found' });
            return res.json({ id: doc.id, data: doc.data() });
        } else {
            ensureFileStore();
            const arr = JSON.parse(fs.readFileSync(FILE_STORE,'utf8'));
            const doc = arr.find(d => d.id === id);
            if (!doc) return res.status(StatusCodes.NOT_FOUND).json({ error: 'Not found' });
            return res.json({ id: doc.id, data: doc });
        }
    } catch (err){
        console.error(err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Unable to get spot' });
    }
}

// Updates a spot
export async function updateSpot(req, res){
// ... (updateSpot function remains unchanged)
    try {
        const id = req.params.id;
        const payload = req.body;
        if (!payload) return res.status(StatusCodes.BAD_REQUEST).json({ error: 'payload required' });
        if (db){
            await db.collection(COLLECTION).doc(id).set(payload, { merge: true });
            const doc = await db.collection(COLLECTION).doc(id).get();
            return res.json({ id: doc.id, data: doc.data() });
        } else {
            ensureFileStore();
            const arr = JSON.parse(fs.readFileSync(FILE_STORE,'utf8'));
            const idx = arr.findIndex(d => d.id === id);
            if (idx === -1) return res.status(StatusCodes.NOT_FOUND).json({ error: 'Not found' });
            arr[idx] = { ...arr[idx], ...payload, updatedAt: new Date().toISOString() };
            fs.writeFileSync(FILE_STORE, JSON.stringify(arr,null,2));
            return res.json({ id, data: arr[idx] });
        }
    } catch (err){
        console.error(err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Unable to update spot' });
    }
}

// Deletes a spot
export async function deleteSpot(req, res){
// ... (deleteSpot function remains unchanged)
    try {
        const id = req.params.id;
        if (db){
            await db.collection(COLLECTION).doc(id).delete();
            return res.status(StatusCodes.NO_CONTENT).send();
        } else {
            ensureFileStore();
            let arr = JSON.parse(fs.readFileSync(FILE_STORE,'utf8'));
            arr = arr.filter(d => d.id !== id);
            fs.writeFileSync(FILE_STORE, JSON.stringify(arr,null,2));
            return res.status(StatusCodes.NO_CONTENT).send();
        }
    } catch (err){
        console.error(err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Unable to delete spot' });
    }
}

/**
 * @desc Books a specific parking spot (POST /api/spots/book)
 * @access Private (Requires verifyFirebaseIdToken)
 */
export async function bookSpot(req, res) {
// ... (bookSpot function remains unchanged)
    // Note: The userId comes from the request after verifyFirebaseIdToken runs
    const userId = req.user ? req.user.uid : 'DEV_USER_BYPASSED'; 
    const { name, email, vehicle, spotId, locationId, pin } = req.body;
    
    // --- Validation ---
    if (!spotId || !locationId || !name || !email || !vehicle || !pin) {
        return res.status(StatusCodes.BAD_REQUEST).json({ 
            error: 'Missing required booking fields (spotId, locationId, name, email, vehicle, or pin).' 
        });
    }

    // Combine location and spot for a unique ID, matching your typical usage (e.g., 'ICT-4A')
    const uniqueSpotId = `${locationId}-${spotId}`; 

    const bookingDetails = {
        status: 'booked',
        isOccupied: true,
        bookedBy: userId,
        name,
        email,
        vehicle,
        spotId: uniqueSpotId, // Save the full ID
        bookedAt: admin.firestore.FieldValue.serverTimestamp ? admin.firestore.FieldValue.serverTimestamp() : new Date().toISOString(),
    };

    try {
        if (db) {
            // --- Firestore Transaction ---
            const spotRef = db.collection(COLLECTION).doc(uniqueSpotId);
            let finalSpotData = {};

            await db.runTransaction(async (t) => {
                const doc = await t.get(spotRef);

                if (!doc.exists) {
                    throw new Error(`Spot ${uniqueSpotId} not found.`);
                }

                const spotData = doc.data();

                // Check if the spot is already booked
                if (spotData.status === 'booked' || spotData.isOccupied) {
                    throw new Error(`Spot ${uniqueSpotId} is already reserved.`);
                }

                // Update the document
                t.update(spotRef, bookingDetails);

                // Prepare the data to be returned (merge old and new)
                finalSpotData = {
                    id: uniqueSpotId,
                    ...spotData, 
                    ...bookingDetails 
                };
            });
            
            // Transaction succeeded
            return res.status(StatusCodes.CREATED).json({ 
                message: `Spot ${uniqueSpotId} successfully booked.`,
                data: finalSpotData // Return the full updated spot data
            });

        } else {
            // --- Local File Store Logic ---
            ensureFileStore();
            let arr = JSON.parse(fs.readFileSync(FILE_STORE,'utf8'));
            const idx = arr.findIndex(d => d.id === uniqueSpotId);

            if (idx === -1) {
                return res.status(StatusCodes.NOT_FOUND).json({ error: `Spot ${uniqueSpotId} not found in file store.` });
            }

            // Check for available count instead of status/isOccupied on the whole spot object
            // To book a spot, we must decrement the available count.
            if (arr[idx].count <= 0) {
                 return res.status(StatusCodes.CONFLICT).json({ error: `Spot ${uniqueSpotId} has no availability left.` });
            }


            // Perform the update
            arr[idx] = { 
                ...arr[idx], 
                ...bookingDetails, 
                count: arr[idx].count - 1, // Decrement count on booking
                bookedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString() 
            };
            
            fs.writeFileSync(FILE_STORE, JSON.stringify(arr, null, 2));

            return res.status(StatusCodes.CREATED).json({ 
                message: `Spot ${uniqueSpotId} successfully booked.`,
                data: arr[idx] // Return the full updated spot data
            });
        }
    } catch (err) {
        console.error("Booking Error:", err.message);
        
        let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        // Check for specific conflict/not found errors from the transaction or file store logic
        if (err.message.includes('already reserved') || err.message.includes('no availability')) {
            statusCode = StatusCodes.CONFLICT; // 409
        } else if (err.message.includes('not found')) {
            statusCode = StatusCodes.NOT_FOUND; // 404
        }
        
        return res.status(statusCode).json({ 
            error: err.message || 'Internal server error during booking.' 
        });
    }
}
