// server/routes/parking.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ParkingLot = require('../models/ParkingLot');
const ParkingSpot = require('../models/ParkingSpot');

// @route GET /api/parking/lots
// @desc Get list of all main parking lots for selection (Frontend: SpotSelection.tsx)
router.get('/lots', auth, async (req, res) => {
    try {
        const lots = await ParkingLot.find().select('name displayColor');
        res.json(lots);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route GET /api/parking/grid/:lotId
// @desc Get real-time status of all spots in a specific lot (Frontend: ParkingGrid.tsx)
router.get('/grid/:lotId', auth, async (req, res) => {
    try {
        const { lotId } = req.params;
        const spots = await ParkingSpot.find({ lotId }).select('spotId status');
        const redis = req.redis;
        
        // DSA: Query Redis Reservation Set for real-time temporary bookings
        const reservedSpotIds = await redis.sMembers(`reservation:${lotId}`);
        const reservedSet = new Set(reservedSpotIds);

        // Merge DB status with Redis Reservation status
        const realTimeGrid = spots.map(spot => {
            let status = spot.status;
            
            // Override 'available' status if it's currently in the Redis Reservation Queue
            if (status === 'available' && reservedSet.has(spot.spotId)) {
                status = 'inBooking';
            }
            
            return { id: spot.spotId, status };
        });

        res.json(realTimeGrid);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route POST /api/parking/reserve
// @desc Temporarily reserve a spot using Redis (DSA: Reservation Queue/Lock)
router.post('/reserve', auth, async (req, res) => {
    const { spotId, lotId } = req.body;
    const redis = req.redis;
    
    try {
        // Check if spot is available in the DB
        const spot = await ParkingSpot.findOne({ spotId, lotId });
        if (!spot || spot.status !== 'available') {
            return res.status(409).json({ message: 'Spot is already booked or unavailable.' });
        }
        
        const key = `reservation:${lotId}`;
        
        // 1. DSA: Add spot to the Redis Set (The concurrent lock)
        // If sAdd returns 1, it was added successfully (spot wasn't reserved).
        const added = await redis.sAdd(key, spotId);
        
        if (added) {
            // Set Redis key expiry (optional, robust worker preferred)
            await redis.expire(key, 300); // 5 minutes reservation time

            // 2. Optimistically update DB status to 'inBooking'
            spot.status = 'inBooking';
            await spot.save();
            
            res.json({ message: 'Spot temporarily reserved.', status: 'inBooking' });
        } else {
            res.status(409).json({ message: 'Spot is already reserved by another user.' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;