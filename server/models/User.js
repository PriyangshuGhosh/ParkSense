// server/models/User.js
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hashed
    name: { type: String, required: true },
    role: { type: String, enum: ['student', 'faculty'], default: 'student' },
});
module.exports = mongoose.model('User', userSchema);