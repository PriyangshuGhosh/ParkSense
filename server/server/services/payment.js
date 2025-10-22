import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class PaymentService {
    static async createPaymentIntent(amount, currency = 'inr', paymentMethodType = ['card']) {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Convert to smallest currency unit
                currency,
                payment_method_types: paymentMethodType,
            });
            return paymentIntent;
        } catch (error) {
            console.error('Payment intent creation failed:', error);
            throw error;
        }
    }

    static async verifyPayment(paymentIntentId) {
        try {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            return paymentIntent.status === 'succeeded';
        } catch (error) {
            console.error('Payment verification failed:', error);
            throw error;
        }
    }

    static calculateParkingFee(durationHours, spotType = 'standard') {
        const baseRate = spotType === 'premium' ? 50 : 30; // INR per hour
        return baseRate * durationHours;
    }
}

export default PaymentService;