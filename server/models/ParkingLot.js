// server/models/ParkingLot.js
const mongoose = require('mongoose');
const parkingLotSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // e.g., 'ICT'
    totalSpots: { type: Number, required: true },
    availableSpots: { type: Number, required: true }, // Real-time count
    displayColor: { type: String }, // e.g., 'bg-spot-red'
});
module.exports = mongoose.model('ParkingLot', parkingLotSchema);