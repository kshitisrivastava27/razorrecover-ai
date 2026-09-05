const mongoose = require("mongoose");

const recoveryAttemptSchema = new mongoose.Schema(
    {
        paymentId: {
            type: String,
            required: true
        },

        strategy: {
            type: String,
            required: true
        },

        reason: {
            type: String,
            required: true
        },

        recommendation: {
            type: String,
            required: true
        },

        recoveryProbability: {
            type: Number,
            default: null
        },

        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium"
        },

        customerMessage: {
            type: String,
            default: null
        },

        status: {
            type: String,
            enum: ["pending", "sent", "successful", "failed"],
            default: "pending"
        },

        aiGenerated: {
            type: Boolean,
            default: false
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