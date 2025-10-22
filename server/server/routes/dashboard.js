// server/routes/dashboard.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Booking = require('../models/Booking');
const ParkingLot = require('../models/ParkingLot');

// @route GET /api/dashboard/summary
// @desc Get current spot and available spot list (Frontend: Dashboard.tsx)
router.get('/summary', auth, async (req, res) => {
    try {
        // 1. Get current active booking
        const currentBooking = await Booking.findOne({
            user: req.user.id,
            status: 'active'
        }).sort({ startTime: -1 });

        let currentSpot = null;
        if (currentBooking) {
            currentSpot = {
                location: currentBooking.spotLocation,
                expiryDate: currentBooking.expiryTime.toLocaleDateString('en-GB'),
                bookingId: currentBooking._id
            };
        }

        // 2. Get available lot summaries
        const availableLots = await ParkingLot.find({ availableSpots: { $gt: 0 } }).select('name availableSpots displayColor');
        const availableSpots = availableLots.map(lot => ({
            name: lot.name,
            count: lot.availableSpots,
            color: lot.displayColor // Matches frontend CSS
        }));

        // 3. Announcements placeholder
        const announcements = [{ title: "New Rule", content: "Parking duration limit is 3 hours." }];

        res.json({ currentSpot, availableSpots, announcements });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;