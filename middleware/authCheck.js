const jwt = require('jsonwebtoken');
const User = require('../models/users');
const authCheck = (role) => {
    return async (req, res, next) => {
        try {
            if (!req.headers.authorization) {
                return res.status(401).json({
                    message: 'Not authorized'
                });
            }
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWTPrivateKey);
            const [user] = await Promise.all([User.findById(decoded.userId).exec()]);
            if (user && !role.includes(user.role)) {
                return res.status(401).json({
                    message: 'Unauthorized Person'
                });
            }
            if (user) {
                req.userData = user;
                next();
            }
        } catch (err) {
            return res.status(401).json({
                message: 'Unauthorized Person'
            });
        }
    }
}

module.exports = authCheck;
