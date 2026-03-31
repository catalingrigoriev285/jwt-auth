const jwt = require("jsonwebtoken");

/**
 * Middleware to verify JWT token from cookies
 */
const verifyToken = (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ 
                message: "Access denied. No token provided." 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ 
                message: "Token expired. Please login again." 
            });
        }
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ 
                message: "Invalid token." 
            });
        }
        return res.status(500).json({ 
            message: "Failed to authenticate token." 
        });
    }
};

/**
 * Middleware to check if user has required role
 */
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                message: "Authentication required." 
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: "Access denied. Insufficient permissions." 
            });
        }

        next();
    };
};

module.exports = { verifyToken, requireRole };
