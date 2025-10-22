import mockPayment from './mockPayment.js';
import Stripe from 'stripe';

const useMock = (process.env.USE_MOCK_PAYMENT || 'true') === 'true';

let stripeClient = null;
if (!useMock && process.env.STRIPE_SECRET_KEY) {
  stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
}

const payment = useMock ? mockPayment : {
  async createPaymentIntent(amount) {
    return stripeClient.paymentIntents.create({ amount: Math.round(amount * 100), currency: 'inr' });
  },
  async verifyPayment(id) {
    const pi = await stripeClient.paymentIntents.retrieve(id);
    return pi && pi.status === 'succeeded';
  },
  calculateParkingFee(durationHours, spotType = 'standard') {
    const baseRate = spotType === 'premium' ? 50 : 30;
    return baseRate * durationHours;
  }
};

export default payment;