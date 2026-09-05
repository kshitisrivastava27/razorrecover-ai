const express = require("express");

const {
    handleRazorpayWebhook
} = require("../controllers/webhookController");

const router = express.Router();

router.post("/", handleRazorpayWebhook);

module.exports = router;