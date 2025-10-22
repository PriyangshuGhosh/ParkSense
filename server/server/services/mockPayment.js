// Mock payment service for development
class PaymentService {
    static paymentStore = new Map(); // Store payment records in memory

    static async createPaymentIntent(amount, currency = 'inr') {
        const paymentId = 'PAY_' + Math.random().toString(36).substr(2, 9);
        const paymentIntent = {
            id: paymentId,
            amount,
            currency,
            status: 'created',
            client_secret: 'sk_test_' + paymentId,
            created: new Date()
        };

        this.paymentStore.set(paymentId, paymentIntent);
        return paymentIntent;
    }

    static async verifyPayment(paymentId) {
        // Auto-approve all payments in development
        const paymentIntent = this.paymentStore.get(paymentId);
        if (paymentIntent) {
            paymentIntent.status = 'succeeded';
            return true;
        }
        return false;
    }

    static calculateParkingFee(durationHours, spotType = 'standard') {
        const baseRate = spotType === 'premium' ? 50 : 30; // INR per hour
        return baseRate * durationHours;
    }
}

export default PaymentService;