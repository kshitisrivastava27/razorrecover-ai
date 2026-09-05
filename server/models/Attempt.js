const mongoose = require("mongoose");

const recoveryAttemptSchema = new mongoose.Schema(
    {
        paymentId: {
            type: String,
            required: true
        },

        action: {
            type: String,
            enum: [
                "RETRY",
                "RETRY_LATER",
                "PAYMENT_LINK",
                "ALTERNATE_PAYMENT",
                "HUMAN_REVIEW"
            ],
            required: true
        },

        reason: {
            type: String
        },

        confidence: {
            type: Number
        },

        status: {
            type: String,
            enum: ["PENDING", "SUCCESS", "FAILED"],
            default: "PENDING"
        },

        result: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "RecoveryAttempt",
    recoveryAttemptSchema
);