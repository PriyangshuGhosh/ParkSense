const Stripe = require('stripe');

let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });
} else {
  console.warn('STRIPE_SECRET_KEY not set — Stripe disabled (mock payment will be used when configured).');
}

const PaymentService = {
  createPaymentIntent: async (opts) => {
    if (!stripe) throw new Error('Stripe not configured');
    return stripe.paymentIntents.create(opts);
  },

  confirmPaymentIntent: async (paymentIntentId) => {
    if (!stripe) throw new Error('Stripe not configured');
    return stripe.paymentIntents.confirm(paymentIntentId);
  },

  refundPayment: async (paymentIntentId, opts = {}) => {
    if (!stripe) throw new Error('Stripe not configured');
    // refund by payment_intent
    return stripe.refunds.create({ payment_intent: paymentIntentId, ...opts });
  }
};

module.exports = PaymentService;
module.exports.stripe = stripe;