// server/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { db, auth, adminAuth } from '../firebase/firebase.js';

// Routes
import authRouter from './routes/auth.js';
import dashboardRouter from './routes/dashboard.js';
import parkingRouter from './routes/parking.js';
import bookingRouter from './routes/booking.js';
import paymentRouter from './routes/payment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

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
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Firebase and Firestore initialized successfully.');
});