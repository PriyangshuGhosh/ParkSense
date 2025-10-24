const MockPayment = require('./mockPayment');

let PaymentService;

if (process.env.USE_MOCK_PAYMENT === 'false' || process.env.USE_MOCK_PAYMENT === '0') {
  try {
    PaymentService = require('./payment');
  } catch (err) {
    console.warn('Real payment service not available; falling back to mock.', err.message || err);
    PaymentService = MockPayment;
  }
} else {
  PaymentService = MockPayment;
}

module.exports = PaymentService;