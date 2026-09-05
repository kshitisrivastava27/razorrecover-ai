const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
    {
        customerId: {
            type: String,
            required: true,
            unique: true
        },

        name: {
            type: String,
            required: true
        },

        email: {
            type: String
        },

        totalTransactions: {
            type: Number,
            default: 0
        },

        successfulTransactions: {
            type: Number,
            default: 0
        },

        failedTransactions: {
            type: Number,
            default: 0
        },

        totalSpent: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Customer", customerSchema);