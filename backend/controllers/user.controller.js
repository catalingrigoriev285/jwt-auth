const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

const createUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // validations
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email and password are required" });
        }

        if(password.length < 6) {
            return res
                .status(400)
                .json({ message: "Password must be at least 6 characters long" });
        }

        // check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email already in use" });
        }

        // create and save new user
        const newUser = new User({
            email,
            password,
            loggedIn: false,
        });

        console.log("Creating user - saving to DB:", { email });
        const savedUser = await newUser.save();
        console.log("User saved:", savedUser && savedUser._id);

        // jwt token
        const token = jwt.sign(
            {
                userId: savedUser._id,
                email: savedUser.email,
                role: savedUser.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "30m" },
        );

        // Set token as HttpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 60 * 1000, // 30 minutes
        });

        res.status(201).json({
            message: "User created successfully",
            token: token,
        });
    } catch (error) {
        console.error("Error creating user:", error, error.stack);
        res.status(500).json({
            message: "Failed to create user",
            details: error.message,
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // validations
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email and password are required" });
        }

        // find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // jwt token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "30m" },
        );

        // Set token as HttpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 60 * 1000, // 30 minutes
        });

        res.status(200).json({
            message: "Login successful",
            token: token,
        });
    } catch (error) {
        console.error("Error logging in user:", error, error.stack);
        res.status(500).json({
            message: "Failed to log in user",
            details: error.message,
        });
    }
};

module.exports = { createUser, loginUser };
