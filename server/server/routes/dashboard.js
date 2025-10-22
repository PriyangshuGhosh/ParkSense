// server/routes/dashboard.js
import express from 'express';
import { query, where } from 'firebase/firestore';
import Booking from '../models/Booking.js';
import ParkingLot from '../models/ParkingLot.js';

const router = express.Router();

// @route GET /api/dashboard/summary
// @desc Get current spot and available spot list (Frontend: Dashboard.tsx)
router.get('/summary', async (req, res) => {
    try {
        const userId = req.user.uid; // From Firebase Auth middleware

        // 1. Get current active booking
        const activeBookings = await Booking.getByUser(userId);
        const currentBooking = activeBookings.find(booking => booking.status === 'active');

        let currentSpot = null;
        if (currentBooking) {
            currentSpot = {
                location: currentBooking.spotLocation,
                expiryDate: currentBooking.expiryTime.toDate().toLocaleDateString('en-GB'),
                bookingId: currentBooking.id
            };
        }

        // 2. Get available lot summaries
        const allLots = await ParkingLot.getAll();
        const availableSpots = allLots
            .filter(lot => lot.availableSpots > 0)
            .map(lot => ({
                name: lot.name,
                count: lot.availableSpots,
                color: lot.displayColor // Matches frontend CSS
            }));

        // 3. Announcements placeholder
        const announcements = [{ title: "New Rule", content: "Parking duration limit is 3 hours." }];

        res.json({ currentSpot, availableSpots, announcements });

    } catch (err) {
        console.error('Dashboard error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;