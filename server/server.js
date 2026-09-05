require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const razorpayRoutes = require("./routes/razorpayRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const recoveryRoutes = require("./routes/recoveryRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());

// Razorpay webhook needs the raw request body
app.use(
    "/api/webhooks/razorpay",
    express.raw({ type: "application/json" }),
    webhookRoutes
);

// Normal JSON requests
app.use(express.json());

app.use("/api/razorpay", razorpayRoutes);
app.use("/api/recovery", recoveryRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "RazorRecover AI backend is running!"
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});