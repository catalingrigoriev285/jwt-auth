const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const connectToDatabase = require("./config/database.config.js");

dotenv.config({
    path: "../.env",
});

const app = express();

// Middleware
app.use(cors({
    origin: "http://localhost:3001",
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

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
