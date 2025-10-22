import express from 'express';
import PaymentService from '../services/payment.js';
import { runTransaction } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import Booking from '../models/Booking.js';
import ParkingSpot from '../models/ParkingSpot.js';

const router = express.Router();

// @route POST /api/payment/create-intent
// @desc Create a payment intent for booking
router.post('/create-intent', async (req, res) => {
    const { spotId, lotId, durationHours, spotType } = req.body;
    const userId = req.user.uid;

    try {
        // Calculate parking fee
        const amount = PaymentService.calculateParkingFee(durationHours, spotType);

        // Create payment intent
        const paymentIntent = await PaymentService.createPaymentIntent(amount);

        // Store payment intent info in Firestore
        await runTransaction(db, async (transaction) => {
            // Check if spot is still available
            const spot = await ParkingSpot.getById(lotId, spotId);
            if (!spot || spot.status !== 'inBooking') {
                throw new Error('Spot is no longer available');
            }

            // Create temporary booking record with payment intent
            await Booking.create({
                user: userId,
                lotId,
                spotId,
                spotLocation: `${lotId.toUpperCase()} - ${spotId}`,
                paymentIntentId: paymentIntent.id,
                amount,
                status: 'pending_payment',
                durationHours,
                createdAt: new Date()
            });
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            amount
        });
    } catch (error) {
        console.error('Payment intent creation failed:', error);
        res.status(500).json({ message: error.message });
    }
});

// @route POST /api/payment/confirm
// @desc Confirm payment and finalize booking
router.post('/confirm', async (req, res) => {
    const { paymentIntentId, bookingId } = req.body;
    const userId = req.user.uid;

    try {
        // Verify payment status
        const isPaymentSuccessful = await PaymentService.verifyPayment(paymentIntentId);
        if (!isPaymentSuccessful) {
            throw new Error('Payment verification failed');
        }

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
        });

        res.json({ message: 'Payment confirmed and booking completed' });
    } catch (error) {
        console.error('Payment confirmation failed:', error);
        res.status(500).json({ message: error.message });
    }
});

// @route POST /api/payment/refund
// @desc Process refund for cancelled booking
router.post('/refund', async (req, res) => {
    const { bookingId } = req.body;
    const userId = req.user.uid;

    try {
        const booking = await Booking.getById(bookingId);
        if (!booking || booking.user !== userId) {
            throw new Error('Booking not found or unauthorized');
        }

        // Calculate refund amount based on usage time
        const usedDuration = (new Date() - booking.createdAt) / (1000 * 60 * 60); // hours
        const refundPercentage = Math.max(0, (booking.durationHours - usedDuration) / booking.durationHours);
        const refundAmount = Math.floor(booking.amount * refundPercentage);

        if (refundAmount > 0) {
            // Process refund through Stripe
            const refund = await stripe.refunds.create({
                payment_intent: booking.paymentIntentId,
                amount: refundAmount * 100 // Convert to smallest currency unit
            });

            // Update booking with refund information
            await Booking.update(bookingId, {
                status: 'refunded',
                refundAmount,
                refundId: refund.id,
                refundedAt: new Date()
            });
        }

        res.json({ message: 'Refund processed successfully', refundAmount });
    } catch (error) {
        console.error('Refund processing failed:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;