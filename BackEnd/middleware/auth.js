const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) 
        return res.status(401).json({ msg: 'No token, authorization denied' });
    
    const token = authHeader.replace('Bearer ', '');
    console.log('Received Token:', token ); // Log the received token

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.userId);
        if (!req.user) 
            return res.status(401).json({ msg: 'User not found' });
        next();
    } catch (err) {
        console.error('Token is not valid:', err.message);
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
