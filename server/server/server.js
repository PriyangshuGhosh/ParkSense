// server/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { db, auth, adminAuth } from '../firebase/firebase.js';
import logger from './logger.js';
import errorHandler from './middleware/errorHandler.js';

// Routes
import authRouter from './routes/auth.js';
import dashboardRouter from './routes/dashboard.js';
import parkingRouter from './routes/parking.js';
import bookingRouter from './routes/booking.js';
import paymentRouter from './routes/payment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env as early as possible
dotenv.config();
logger.info('Environment loaded', { nodeEnv: process.env.NODE_ENV });

// Initialize Express App
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Auth Middleware
app.use(async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            next();
            return;
        }

        const decodedToken = await adminAuth.verifyIdToken(token);
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            role: decodedToken.role || 'student'
        };
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        next();
    }
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/parking', parkingRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/payment', paymentRouter);

// Error handling middleware
// Centralized error handler (should be last middleware)
app.use(errorHandler);

// Sanity checks
if (process.env.NODE_ENV === 'production' && !adminAuth) {
    logger.error('Firebase Admin SDK not initialized in production. Exiting.');
    process.exit(1);
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info('Firebase and Firestore initialized successfully.');
});