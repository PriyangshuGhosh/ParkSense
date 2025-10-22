// server/middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Get token from header (usually 'x-auth-token')
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user; // { id: userId, role: userRole }
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};