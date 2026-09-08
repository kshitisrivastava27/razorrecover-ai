require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const razorpayRoutes = require("./routes/razorpayRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const recoveryRoutes = require("./routes/recoveryRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();

// Render provides process.env.PORT
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Allow frontend requests
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

// Razorpay webhook needs the RAW request body
app.use(
    "/api/webhooks/razorpay",
    express.raw({ type: "application/json" }),
    webhookRoutes
);

// Normal JSON requests
app.use(express.json());

// API routes
app.use("/api/razorpay", razorpayRoutes);
app.use("/api/recovery", recoveryRoutes);
app.use("/api/analytics", analyticsRoutes);

// Health check
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "RazorRecover AI backend is running!"
    });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});