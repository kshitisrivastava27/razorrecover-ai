const Payment = require("../models/Payment");
const RecoveryAttempt = require("../models/RecoveryAttempt");

const getAnalytics = async (req, res) => {
    try {

        // Total failed payments
        const totalFailedPayments =
            await Payment.countDocuments({
                status: "failed"
            });

        // Total recovery attempts
        const totalRecoveryAttempts =
            await RecoveryAttempt.countDocuments();

        // Successful recoveries
        const successfulRecoveries =
            await RecoveryAttempt.countDocuments({
                status: "successful"
            });

        // Pending recoveries
        const pendingRecoveries =
            await RecoveryAttempt.countDocuments({
                status: "pending"
            });

        // Sent recoveries
        const sentRecoveries =
            await RecoveryAttempt.countDocuments({
                status: "sent"
            });

        // Failed recovery attempts
        const failedRecoveries =
            await RecoveryAttempt.countDocuments({
                status: "failed"
            });

        // Recovery rate
        const recoveryRate =
            totalRecoveryAttempts > 0
                ? (
                    successfulRecoveries /
                    totalRecoveryAttempts
                ) * 100
                : 0;

        // Find successful recovery attempts
        const successfulAttempts =
            await RecoveryAttempt.find({
                status: "successful"
            });

        let totalRecoveredAmount = 0;

        // Calculate recovered amount
        for (const attempt of successfulAttempts) {

            const payment =
                await Payment.findOne({
                    paymentId: attempt.paymentId
                });

            if (payment) {
                totalRecoveredAmount += payment.amount;
            }
        }

        // Send analytics
        res.status(200).json({

            success: true,

            analytics: {

                totalFailedPayments,

                totalRecoveryAttempts,

                successfulRecoveries,

                pendingRecoveries,

                sentRecoveries,

                failedRecoveries,

                recoveryRate:
                    Number(
                        recoveryRate.toFixed(2)
                    ),

                totalRecoveredAmount
            }
        });

    } catch (error) {

        console.error(
            "❌ Analytics Error:",
            error
        );

        res.status(500).json({

            success: false,

            message: error.message
        });
    }
};

module.exports = {
    getAnalytics
};