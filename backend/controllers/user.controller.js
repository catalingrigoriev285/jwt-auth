const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
    return jwt.sign(
        {
            userId: user._id,
            email: user.email,
            role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m" },
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d",
    });
};

const setAuthCookies = (res, accessToken, refreshToken) => {
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "strict" : "lax",
        maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "strict" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/api/users/refresh",
    });
};

const createUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                message: "Email already in use",
            });
        }

        // Create and save new user
        const newUser = new User({ email, password });
        const savedUser = await newUser.save();

        // Generate tokens
        const accessToken = generateAccessToken(savedUser);
        const refreshToken = generateRefreshToken(savedUser);

        // Save refresh token to user document
        savedUser.refreshToken = refreshToken;
        await savedUser.save();

        // Set cookies
        setAuthCookies(res, accessToken, refreshToken);

        res.status(201).json({
            message: "User created successfully",
            user: {
                id: savedUser._id,
                email: savedUser.email,
                role: savedUser.role,
            },
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({
            message: "Failed to create user",
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Save refresh token to user document
        user.refreshToken = refreshToken;
        await user.save();

        // Set cookies
        setAuthCookies(res, accessToken, refreshToken);

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({
            message: "Failed to log in user",
        });
    }
};

const logoutUser = async (req, res) => {
    try {
        // Clear refresh token from database
        await User.findByIdAndUpdate(req.user.userId, {
            refreshToken: null,
        });

        // Clear cookies
        res.clearCookie("token");
        res.clearCookie("refreshToken", { path: "/api/users/refresh" });

        res.status(200).json({
            message: "Logout successful",
        });
    } catch (error) {
        console.error("Error logging out user:", error);
        res.status(500).json({
            message: "Failed to log out user",
        });
    }
};

const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.status(401).json({
                message: "Refresh token not provided",
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET,
        );

        // Find user and verify refresh token matches
        const user = await User.findById(decoded.userId);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({
                message: "Invalid refresh token",
            });
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(user);

        // Set new access token cookie
        const isProduction = process.env.NODE_ENV === "production";
        res.cookie("token", newAccessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "strict" : "lax",
            maxAge: 15 * 60 * 1000,
        });

        res.status(200).json({
            message: "Token refreshed successfully",
        });
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Refresh token expired. Please login again.",
            });
        }
        console.error("Error refreshing token:", error);
        res.status(500).json({
            message: "Failed to refresh token",
        });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.status(200).json({
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({
            message: "Failed to fetch user",
        });
    }
};

module.exports = {
    createUser,
    loginUser,
    logoutUser,
    refreshToken,
    getCurrentUser,
};
