// server/models/ParkingSpot.js
const mongoose = require('mongoose');
const parkingSpotSchema = new mongoose.Schema({
    spotId: { type: String, required: true }, // e.g., '1 A'
    lotId: { type: String, required: true, index: true },  // e.g., 'ict'
    status: { type: String, enum: ['available', 'booked', 'inBooking', 'unavailable'], default: 'available' },
    currentBooking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
    // DSA: Adjacency List for Graph Traversal
    adjacentSpots: [{ type: String }], // Array of connected spotIds (e.g., for pathfinding)
    lastUpdateTime: { type: Date, default: Date.now }
});
parkingSpotSchema.index({ spotId: 1, lotId: 1 }, { unique: true });
module.exports = mongoose.model('ParkingSpot', parkingSpotSchema);