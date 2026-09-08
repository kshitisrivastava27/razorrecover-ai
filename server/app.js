const express = require("express");
const cors = require("cors");
require("dotenv").config();

// -----------------------------------------
// ROUTES
// -----------------------------------------
const razorpayRoutes = require("./routes/razorpayRoutes");
const recoveryRoutes = require("./routes/recoveryRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const webhookRoutes = require("./routes/webhookRoutes");

// -----------------------------------------
// APP
// -----------------------------------------
const app = express();

// -----------------------------------------
// CORS
// -----------------------------------------
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:3000",
    "https://razorrecover-ai-frontend.onrender.com"
];

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin
            // such as Postman/server-to-server requests
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            console.log("❌ CORS blocked origin:", origin);

            return callback(
                new Error("Not allowed by CORS")
            );
        },

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ],

        credentials: true
    })
);

// Handle preflight requests
app.options("*", cors());

// -----------------------------------------
// BODY PARSER
// -----------------------------------------
app.use(express.json());

// -----------------------------------------
// ROOT ROUTE
// -----------------------------------------
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "RazorRecover AI backend is running"
    });
});

// -----------------------------------------
// API ROUTES
// -----------------------------------------

// Razorpay
app.use(
    "/api/razorpay",
    razorpayRoutes
);

// Recovery
app.use(
    "/api/recovery",
    recoveryRoutes
);

// Analytics
app.use(
    "/api/analytics",
    analyticsRoutes
);

// Razorpay Webhooks
app.use(
    "/api/webhook",
    webhookRoutes
);

// -----------------------------------------
// 404 HANDLER
// -----------------------------------------
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
        path: req.originalUrl
    });
});

// -----------------------------------------
// ERROR HANDLER
// -----------------------------------------
app.use((err, req, res, next) => {
    console.error("❌ Server Error:", err);

    if (err.message === "Not allowed by CORS") {
        return res.status(403).json({
            success: false,
            message: "CORS policy blocked this request"
        });
    }

    res.status(500).json({
        success: false,
        message: err.message || "Internal server error"
    });
});

// -----------------------------------------
// EXPORT
// -----------------------------------------
module.exports = app;