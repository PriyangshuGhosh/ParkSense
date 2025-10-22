import express from 'express';
import PaymentService from '../services/mockPayment.js';
import { runTransaction } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import Booking from '../models/Booking.js';
import ParkingSpot from '../models/ParkingSpot.js';

const router = express.Router();

// @route POST /api/payment/init
// @desc Initialize payment for booking
router.post('/init', async (req, res) => {
    const { spotId, lotId, durationHours, spotType } = req.body;
    const userId = req.user.uid;

    try {
        // Calculate parking fee
        const amount = PaymentService.calculateParkingFee(durationHours, spotType);

        // Create mock payment intent
        const paymentIntent = await PaymentService.createPaymentIntent(amount);

        // Create temporary booking record
        await runTransaction(db, async (transaction) => {
            // Check spot availability
            const spot = await ParkingSpot.getById(lotId, spotId);
            if (!spot || spot.status !== 'available') {
                throw new Error('Spot is not available');
            }

            // Update spot status to 'inBooking'
            await ParkingSpot.update(lotId, spotId, {
                status: 'inBooking',
                reservedBy: userId,
                reservationExpiry: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes reservation
            });

            // Create booking record
            const booking = await Booking.create({
                user: userId,
                lotId,
                spotId,
                spotLocation: `${lotId.toUpperCase()} - ${spotId}`,
                paymentIntentId: paymentIntent.id,
                amount,
                status: 'pending_payment',
                durationHours,
                expiryTime: new Date(Date.now() + durationHours * 60 * 60 * 1000),
                createdAt: new Date()
            });

            res.json({
                bookingId: booking.id,
                paymentId: paymentIntent.id,
                amount
            });
        });
    } catch (error) {
        console.error('Payment initialization failed:', error);
        res.status(500).json({ message: error.message });
    }
});

// @route POST /api/payment/confirm
// @desc Confirm mock payment and finalize booking
router.post('/confirm', async (req, res) => {
    const { paymentId, bookingId } = req.body;
    const userId = req.user.uid;

    try {
        // Auto-verify the mock payment
        const isPaymentSuccessful = await PaymentService.verifyPayment(paymentId);

        await runTransaction(db, async (transaction) => {
            // Get booking details
            const booking = await Booking.getById(bookingId);
            if (!booking || booking.user !== userId) {
                throw new Error('Booking not found or unauthorized');
            }

            // Update booking status
            await Booking.update(bookingId, {
                status: 'active',
                paymentStatus: 'completed',
                confirmedAt: new Date()
            });

            // Update spot status
            await ParkingSpot.update(booking.lotId, booking.spotId, {
                status: 'booked',
                currentBooking: bookingId
            });

            res.json({
                message: 'Payment confirmed and booking completed',
                bookingId,
                spotId: booking.spotId,
                lotId: booking.lotId,
                expiryTime: booking.expiryTime
            });
        });
    } catch (error) {
        console.error('Payment confirmation failed:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;