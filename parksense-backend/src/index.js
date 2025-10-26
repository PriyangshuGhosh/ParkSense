import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';

// --- CRITICAL IMPORT: Firebase Admin Initializer ---
import initFirebaseAdmin from './firebaseAdmin.js'; 

import spotsRouter from './routes/spots.js';
import authRouter from './routes/auth.js';

dotenv.config();

// --- CRITICAL FIX: Initialize Firebase Admin before mounting routes ---
initFirebaseAdmin(); 
// ---------------------------------------------------------------------

const app = express();
const PORT = process.env.PORT || 5000;

// Basic security & parsing
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// CORS - allow VITE_API_BASE origin or env OR all in development
const allowedOrigin = process.env.CLIENT_ORIGIN || process.env.VITE_API_BASE || (process.env.NODE_ENV === 'production' ? '' : '*');
app.use(cors({
    origin: allowedOrigin === '*' ? '*' : allowedOrigin
}));

// Rate limiter
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 120
});
app.use('/api', limiter);

// Mount API
app.use('/api/spots', spotsRouter); // This will now run AFTER initialization
app.use('/api/auth', authRouter);

// Serve frontend build if present
const __dirname = path.resolve();
const buildPath = path.join(__dirname, '..', '..', 'parksense-frontend', 'build');
if (fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));
    app.get(/^(?!\/api).*/, (req, res) => {
        res.sendFile(path.join(buildPath, 'index.html'));
    });
}

// Generic error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
