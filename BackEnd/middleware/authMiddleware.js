import jwt from "jsonwebtoken";
import User from "../model/userModel.js";

// ================= AUTH MIDDLEWARE =================
// Check login (token)
export const authMiddleware = async (req, res, next) => {
    try {
        let token;

        // Expect: Authorization: Bearer <token>
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ message: "Not authorized, token missing" });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user to request (without password)
        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) {
            return res.status(401).json({ message: "User not found" });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: "Not authorized, invalid token" });
    }
};

// ================= ADMIN MIDDLEWARE =================
// Only admin / super roles
export const adminMiddleware = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Not authorized" });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Access denied: insufficient permission"
            });
        }

        next();
    };
};


export const protect = async (req, res, next) => {
    try {
        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) {
            return res.status(401).json({ message: "User not found" });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: "Not authorized, token failed" });
    }
};

// ================= OPTIONAL AUTH =================
// Attach req.user if token exists; do not block if missing/invalid
export const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (user) {
            req.user = user;
        }

        return next();
    } catch (error) {
        // If token is invalid, continue without user.
        return next();
    }
};
