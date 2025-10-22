// server/routes/booking.js
import express from 'express';
import { getAuth } from 'firebase/auth';
import { db } from '../../firebase/firebase.js';
import { runTransaction } from 'firebase/firestore';
import Booking from '../models/Booking.js';
import ParkingSpot from '../models/ParkingSpot.js';
import ParkingLot from '../models/ParkingLot.js';

const router = express.Router();
const auth = getAuth();

// @route POST /api/booking/confirm
// @desc Finalize the spot booking (Firebase Transaction)
router.post('/confirm', async (req, res) => {
    const { spotId, lotId, vehicle, paymentMethod } = req.body;
    const userId = req.user.uid; // From Firebase Auth middleware
    const durationHours = 2; // Fixed booking duration

    try {
        // Run transaction
        await runTransaction(db, async (transaction) => {
            // Check and get the spot
            const spot = await ParkingSpot.getById(lotId, spotId);
            if (!spot || spot.status !== 'inBooking') {
                throw new Error('Spot status conflict or reservation invalid.');
            }

            const expiryTime = new Date(Date.now() + durationHours * 60 * 60 * 1000);

            // Create booking
            const newBooking = await Booking.create({
                user: userId,
                lotId,
                spotId,
                spotLocation: `${lotId.toUpperCase()} - ${spotId}`,
                expiryTime,
                vehicleType: vehicle,
                paymentMethod,
                status: 'active'
            });

            // Update spot status
            await ParkingSpot.update(lotId, spotId, {
                status: 'booked',
                currentBooking: newBooking.id
            });

            // Update lot available spots
            const lot = await ParkingLot.getById(lotId);
            await ParkingLot.update(lotId, {
                availableSpots: lot.availableSpots - 1
            });

            res.status(201).json({ message: 'Booking confirmed!', booking: newBooking });
        });
    } catch (error) {
        console.error('Booking failed:', error);
        res.status(500).json({ message: 'Booking failed. Please try again.' });
    }
});

// @route POST /api/booking/abandon/:bookingId
// @desc Release an active spot (Dashboard.tsx - Abandon Spot)
router.post('/abandon/:bookingId', async (req, res) => {
    const { bookingId } = req.params;
    const userId = req.user.uid; // From Firebase Auth middleware

    try {
        await runTransaction(db, async (transaction) => {
            // Get and verify booking
            const booking = await Booking.getById(bookingId);
            if (!booking || booking.user !== userId || booking.status !== 'active') {
                throw new Error('Booking not found or not active.');
            }

            // Update spot status
            await ParkingSpot.update(booking.lotId, booking.spotId, {
                status: 'available',
                currentBooking: null
            });

            // Update booking status
            await Booking.updateStatus(bookingId, 'abandoned');

            // Update lot available spots
            const lot = await ParkingLot.getById(booking.lotId);
            await ParkingLot.update(booking.lotId, {
                availableSpots: lot.availableSpots + 1
            });

            res.json({ message: 'Spot successfully abandoned and released.' });
        });
    } catch (error) {
        console.error('Abandon failed:', error);
        res.status(500).json({ message: 'Failed to abandon spot. Please try again.' });
    }
});

// @route POST /api/booking/extend/:bookingId
// @desc Extend the expiry time of an active spot (Dashboard.tsx - Extend Spot)
router.post('/extend/:bookingId', async (req, res) => {
    const { bookingId } = req.params;
    const { additionalHours } = req.body;
    const userId = req.user.uid; // From Firebase Auth middleware

    try {
        // Get and verify booking
        const booking = await Booking.getById(bookingId);
        if (!booking || booking.user !== userId || booking.status !== 'active') {
            return res.status(404).json({ message: 'Active booking not found.' });
        }

        // Extend booking
        const updatedBooking = await Booking.extendBooking(bookingId, additionalHours);
        
        res.json({
            message: `Booking extended by ${additionalHours} hours.`,
            newExpiry: updatedBooking.expiryTime.toLocaleTimeString()
        });
    } catch (error) {
        console.error('Extension failed:', error);
        res.status(500).json({ message: 'Failed to extend booking. Please try again.' });
    }
});

export default router;