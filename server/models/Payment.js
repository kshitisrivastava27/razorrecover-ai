const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        paymentId: {
            type: String,
            required: true,
            unique: true
        },

        orderId: {
            type: String,
            required: true
        },

        amount: {
            type: Number,
            required: true
        },

        currency: {
            type: String,
            default: "INR"
        },

        status: {
            type: String,
            enum: ["created", "authorized", "captured", "failed"],
            default: "created"
        },

        method: {
            type: String,
            default: null
        },

        errorCode: {
            type: String,
            default: null
        },

        errorDescription: {
            type: String,
            default: null
        },

        errorReason: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Payment", paymentSchema);