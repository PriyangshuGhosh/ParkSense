// server/routes/parking.js
import express from 'express';
import { db } from '../../firebase/firebase.js';
import { runTransaction } from 'firebase/firestore';
import ParkingLot from '../models/ParkingLot.js';
import ParkingSpot from '../models/ParkingSpot.js';

const router = express.Router();

// @route GET /api/parking/lots
// @desc Get list of all main parking lots for selection (Frontend: SpotSelection.tsx)
router.get('/lots', async (req, res) => {
    try {
        const lots = await ParkingLot.getAll();
        res.json(lots.map(lot => ({
            name: lot.name,
            displayColor: lot.displayColor
        })));
    } catch (err) {
        console.error('Error fetching lots:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route GET /api/parking/grid/:lotId
// @desc Get real-time status of all spots in a specific lot (Frontend: ParkingGrid.tsx)
router.get('/grid/:lotId', async (req, res) => {
    try {
        const { lotId } = req.params;
        const spots = await ParkingSpot.getByLotId(lotId);
        
        const realTimeGrid = spots.map(spot => ({
            id: spot.spotId,
            status: spot.status
        }));

        res.json(realTimeGrid);
    } catch (err) {
        console.error('Error fetching grid:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route POST /api/parking/reserve
// @desc Temporarily reserve a spot using Firestore transaction
router.post('/reserve', async (req, res) => {
    const { spotId, lotId } = req.body;
    const userId = req.user.uid; // From Firebase Auth middleware
    
    try {
        await runTransaction(db, async (transaction) => {
            // Check if spot is available
            const spot = await ParkingSpot.getById(lotId, spotId);
            if (!spot || spot.status !== 'available') {
                throw new Error('Spot is already booked or unavailable.');
            }

            // Update spot status to 'inBooking'
            await ParkingSpot.update(lotId, spotId, {
                status: 'inBooking',
                reservedBy: userId,
                reservationExpiry: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
            });
        });

        // Set up a Cloud Function to clear reservation after 5 minutes
        // This should be implemented separately in Firebase Cloud Functions

        res.json({ message: 'Spot temporarily reserved.', status: 'inBooking' });
    } catch (err) {
        console.error('Reservation error:', err);
        if (err.message.includes('already booked')) {
            res.status(409).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'Server error' });
        }
    }
});

export default router;