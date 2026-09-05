const express = require("express");

const {
    getRecoveryAttempts,
    retryPayment,
    getRecoveryAnalytics
} = require("../controllers/recoveryController");

const router = express.Router();


// Get analytics
router.get("/analytics", getRecoveryAnalytics);


// Get recovery attempts
router.get("/", getRecoveryAttempts);


// Retry payment
router.post("/:id/retry", retryPayment);


module.exports = router;