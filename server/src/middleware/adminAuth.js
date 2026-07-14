const User = require('../models/user');

module.exports = async (req, res, next) => {
    try {
        // Check if user is authenticated first
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Find user
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if admin
        if (!user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};