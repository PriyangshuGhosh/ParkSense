// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const redis = require('redis');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Express App
const app = express();
app.use(express.json()); // Body parser

// ----------------------------------------------------
// Database & Cache Connections
// ----------------------------------------------------
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully.');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};

const redisClient = redis.createClient({ url: process.env.REDIS_URL });
redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect().then(() => console.log('Redis connected successfully.')).catch(err => {
    console.error('Redis connection error:', err.message);
});

// Middleware to inject Redis and MongoDB into request
app.use((req, res, next) => {
    req.redis = redisClient;
    req.mongoose = mongoose;
    next();
});

// ----------------------------------------------------
// Routes
// ----------------------------------------------------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/parking', require('./routes/parking'));
app.use('/api/booking', require.use('./routes/booking'));

// Start server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});