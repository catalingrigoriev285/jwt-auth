const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const dotenv = require("dotenv");
const connectToDatabase = require("./config/database.config.js");
const { apiLimiter } = require("./middleware/rateLimiter.middleware.js");

dotenv.config({
    path: "../.env",
});

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "10kb" })); // Limit body size
app.use(cookieParser());
app.use(apiLimiter);

// Routes imports
const userRoutes = require("./routes/user.route");

// Routes declarations
app.use("/api/users", userRoutes);

const start = async () => {
    try {
        await connectToDatabase();

        app.listen(process.env.SERVER_PORT || 3000, () => {
            console.log(
                `Server is running on port ${process.env.SERVER_PORT || 3000}`,
            );
        });
    } catch (error) {
        console.error("Error starting the server:", error);
    }
};

start();
