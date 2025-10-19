// server/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @route POST /api/auth/login
// @desc Authenticate user & get token (Frontend: Index.tsx)
router.post('/login', async (req, res) => {
    const { userId, password } = req.body;
    try {
        // In a real app, hash and compare password using bcrypt
        const user = await User.findOne({ userId });
        if (!user || password !== 'demo') { // Simplified check for this example
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const payload = { user: { id: user.id, userId: user.userId, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { userId: user.userId, name: user.name } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;