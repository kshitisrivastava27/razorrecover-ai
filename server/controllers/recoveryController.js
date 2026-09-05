const Razorpay = require("razorpay");
const RecoveryAttempt = require("../models/RecoveryAttempt");
const Payment = require("../models/Payment");


// =========================================
// GET RECOVERY ATTEMPTS
// =========================================

const getRecoveryAttempts = async (req, res) => {
    try {

        const attempts = await RecoveryAttempt.find()
            .sort({ createdAt: -1 })
            .lean();

        // Add payment information to every recovery attempt
        const attemptsWithPayment = await Promise.all(
            attempts.map(async (attempt) => {

                const payment = await Payment.findOne({
                    paymentId: attempt.paymentId
                }).lean();

                return {
                    ...attempt,

                    amount: payment?.amount || 0,

                    currency: payment?.currency || "INR",

                    method: payment?.method || "unknown",

                    originalPaymentStatus:
                        payment?.status || "unknown",

                    errorCode:
                        payment?.errorCode || null,

                    errorReason:
                        payment?.errorReason || null
                };
            })
        );

        res.status(200).json({
            success: true,
            count: attemptsWithPayment.length,
            attempts: attemptsWithPayment
        });

    } catch (error) {

        console.error(
            "❌ Error fetching recovery attempts:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =========================================
// RETRY PAYMENT
// =========================================

const retryPayment = async (req, res) => {

    try {

        const { id } = req.params;

        const recoveryAttempt =
            await RecoveryAttempt.findById(id);

        if (!recoveryAttempt) {

            return res.status(404).json({
                success: false,
                message: "Recovery attempt not found"
            });
        }


        const payment =
            await Payment.findOne({
                paymentId: recoveryAttempt.paymentId
            });

        if (!payment) {

            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }


        const razorpay = new Razorpay({

            key_id:
                process.env.RAZORPAY_KEY_ID,

            key_secret:
                process.env.RAZORPAY_KEY_SECRET
        });


        const order =
            await razorpay.orders.create({

                amount: payment.amount * 100,

                currency:
                    payment.currency || "INR",

                receipt:
                    `retry_${Date.now()}`,

                notes: {

                    originalPaymentId:
                        payment.paymentId,

                    recoveryAttemptId:
                        recoveryAttempt._id.toString(),

                    recoveryStrategy:
                        recoveryAttempt.strategy
                }
            });


        console.log(
            "🔄 Retry payment order created:",
            order.id
        );


        recoveryAttempt.status = "sent";

        await recoveryAttempt.save();


        res.status(200).json({

            success: true,

            message:
                "Retry payment order created",

            order: {

                id: order.id,

                amount: order.amount,

                currency: order.currency
            },

            key:
                process.env.RAZORPAY_KEY_ID
        });


    } catch (error) {

        console.error(
            "❌ Retry payment error:",
            error
        );

        res.status(500).json({

            success: false,

            message: error.message
        });
    }
};


// =========================================
// GET RECOVERY ANALYTICS
// =========================================

const getRecoveryAnalytics = async (req, res) => {

    try {

        // -----------------------------------------
        // TOTAL FAILED PAYMENTS
        // -----------------------------------------

        const totalFailedPayments =
            await Payment.countDocuments({
                status: "failed"
            });


        // -----------------------------------------
        // TOTAL RECOVERY ATTEMPTS
        // -----------------------------------------

        const totalRecoveryAttempts =
            await RecoveryAttempt.countDocuments();


        // -----------------------------------------
        // SUCCESSFUL RECOVERIES
        // -----------------------------------------

        const successfulRecoveries =
            await RecoveryAttempt.countDocuments({
                status: "successful"
            });


        // -----------------------------------------
        // PENDING RECOVERIES
        // -----------------------------------------

        const pendingRecoveries =
            await RecoveryAttempt.countDocuments({
                status: "pending"
            });


        // -----------------------------------------
        // FAILED RECOVERIES
        // -----------------------------------------

        const failedRecoveries =
            await RecoveryAttempt.countDocuments({
                status: "failed"
            });


        // -----------------------------------------
        // SENT / IN-PROGRESS RECOVERIES
        // -----------------------------------------

        const sentRecoveries =
            await RecoveryAttempt.countDocuments({
                status: "sent"
            });


        // -----------------------------------------
        // RECOVERY RATE
        // -----------------------------------------

        let recoveryRate = 0;

        if (totalRecoveryAttempts > 0) {

            recoveryRate =
                (
                    successfulRecoveries /
                    totalRecoveryAttempts
                ) * 100;

        }


        // -----------------------------------------
        // TOTAL RECOVERED AMOUNT
        // -----------------------------------------

        const successfulAttempts =
            await RecoveryAttempt.find({
                status: "successful"
            });


        let totalRecoveredAmount = 0;


        for (const attempt of successfulAttempts) {

            const payment =
                await Payment.findOne({
                    paymentId: attempt.paymentId
                });

            if (payment) {

                totalRecoveredAmount +=
                    payment.amount || 0;
            }
        }


        // -----------------------------------------
        // SEND RESPONSE
        // -----------------------------------------

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
            "❌ Error fetching recovery analytics:",
            error
        );

        res.status(500).json({

            success: false,

            message: error.message
        });
    }
};


module.exports = {

    getRecoveryAttempts,

    retryPayment,

    getRecoveryAnalytics
};