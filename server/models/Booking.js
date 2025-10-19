// server/routes/booking.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Booking = require('../models/Booking');
const ParkingSpot = require('../models/ParkingSpot');
const ParkingLot = require('../models/ParkingLot');

// @route POST /api/booking/confirm
// @desc Finalize the spot booking (DSA: Atomic Transaction)
router.post('/confirm', auth, async (req, res) => {
    const { spotId, lotId, name, email, vehicle, paymentMethod } = req.body;
    const userId = req.user.id;
    const redis = req.redis;
    const mongoose = req.mongoose;
    
    const durationHours = 2; // Fixed booking duration for example

    // 1. Check Redis Reservation Queue (Initial safety check)
    const isReserved = await redis.sIsMember(`reservation:${lotId}`, spotId);
    if (!isReserved) {
        return res.status(409).json({ message: 'Spot reservation expired. Please select the spot again.' });
    }

    // DSA: Start Atomic Transaction for database integrity
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const expiryTime = new Date(Date.now() + durationHours * 60 * 60 * 1000);

        // Check and lock the spot within the transaction
        const spot = await ParkingSpot.findOne({ spotId, lotId, status: 'inBooking' }).session(session);
        if (!spot) {
            throw new Error('Spot status conflict or reservation invalid.');
        }

        // 2. Create the permanent Booking record
        const newBooking = new Booking({
            user: userId,
            lotId,
            spotLocation: `${lotId.toUpperCase()} - ${spotId}`,
            expiryTime,
            vehicleType: vehicle,
            paymentMethod,
            status: 'active'
        });
        await newBooking.save({ session });

        // 3. Update the Parking Spot status to 'booked'
        spot.status = 'booked';
        spot.currentBooking = newBooking._id;
        await spot.save({ session });

        // 4. Decrement the Available Spot count for the main Lot
        await ParkingLot.updateOne({ name: lotId }, { $inc: { availableSpots: -1 } }).session(session);

        await session.commitTransaction();

        // 5. Cleanup: Remove the temporary reservation from Redis
        await redis.sRem(`reservation:${lotId}`, spotId);

        res.status(201).json({ message: 'Booking confirmed!', booking: newBooking });

    } catch (error) {
        // Rollback on database failure
        await session.abortTransaction();
        console.error('Booking failed with rollback:', error);
        await redis.sRem(`reservation:${lotId}`, spotId); // Also clear the temp reservation
        res.status(500).json({ message: 'Booking failed due to internal conflict. Please try again.' });
    } finally {
        session.endSession();
    }
});

// @route POST /api/booking/abandon/:bookingId
// @desc Release an active spot (Dashboard.tsx - Abandon Spot)
router.post('/abandon/:bookingId', auth, async (req, res) => {
    const { bookingId } = req.params;
    
    // DSA: Atomic Transaction for releasing resources
    const session = await req.mongoose.startSession();
    session.startTransaction();

    try {
        const booking = await Booking.findOne({ _id: bookingId, user: req.user.id, status: 'active' }).session(session);
        if (!booking) {
            throw new Error('Booking not found or not active.');
        }

        // 1. Find and update the associated parking spot
        const spot = await ParkingSpot.findOneAndUpdate(
            { currentBooking: bookingId },
            { $set: { status: 'available', currentBooking: null } },
            { new: true, session }
        );
        if (!spot) throw new Error('Associated spot not found.');

        // 2. Update booking status
        booking.status = 'abandoned';
        await booking.save({ session });

        // 3. Increment the Available Spot count for the main Lot
        await ParkingLot.updateOne({ name: booking.lotId }, { $inc: { availableSpots: 1 } }).session(session);

        await session.commitTransaction();
        res.json({ message: 'Spot successfully abandoned and released.' });

    } catch (err) {
        await session.abortTransaction();
        console.error(err.message);
        res.status(500).send('Server error during abandonment.');
    } finally {
        session.endSession();
    }
});

// @route POST /api/booking/extend/:bookingId
// @desc Extend the expiry time of an active spot (Dashboard.tsx - Extend Spot)
router.post('/extend/:bookingId', auth, async (req, res) => {
    const { bookingId } = req.params;
    const { additionalHours } = req.body; // e.g., 1 or 2 hours

    try {
        const booking = await Booking.findOne({ _id: bookingId, user: req.user.id, status: 'active' });
        if (!booking) {
            return res.status(404).json({ message: 'Active booking not found.' });
        }

        // Calculate new expiry time
        const newExpiryTime = new Date(booking.expiryTime.getTime() + additionalHours * 60 * 60 * 1000);

        booking.expiryTime = newExpiryTime;
        await booking.save();

        res.json({ 
            message: `Booking extended by ${additionalHours} hours.`,
            newExpiry: newExpiryTime.toLocaleTimeString()
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error during extension.');
    }
});

module.exports = router;