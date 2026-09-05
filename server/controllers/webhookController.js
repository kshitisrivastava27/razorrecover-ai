const crypto = require("crypto");
const Razorpay = require("razorpay");

const Payment = require("../models/Payment");
const RecoveryAttempt = require("../models/RecoveryAttempt");

const {
    generateRecoveryStrategy
} = require("../services/recoveryService");


// =========================================
// RAZORPAY WEBHOOK
// =========================================

const handleRazorpayWebhook = async (req, res) => {

    try {

        const webhookSecret =
            process.env.RAZORPAY_WEBHOOK_SECRET;

        const signature =
            req.headers["x-razorpay-signature"];


        // =========================================
        // VERIFY WEBHOOK SIGNATURE
        // =========================================

        const expectedSignature =
            crypto
                .createHmac("sha256", webhookSecret)
                .update(req.body)
                .digest("hex");


        if (signature !== expectedSignature) {

            console.log(
                "❌ Invalid Razorpay webhook signature"
            );

            return res.status(400).json({
                success: false,
                message: "Invalid webhook signature"
            });
        }


        // =========================================
        // PARSE WEBHOOK
        // =========================================

        const event =
            JSON.parse(req.body.toString());


        console.log("=================================");
        console.log("✅ Razorpay Webhook Received");
        console.log("Event:", event.event);
        console.log("=================================");


        // =========================================
        // PAYMENT CAPTURED
        // =========================================

        switch (event.event) {

            case "payment.captured": {

                const payment =
                    event.payload.payment.entity;


                // -----------------------------------------
                // SAVE PAYMENT
                // -----------------------------------------

                await Payment.findOneAndUpdate(
                    {
                        paymentId: payment.id
                    },
                    {
                        paymentId: payment.id,

                        orderId:
                            payment.order_id,

                        amount:
                            payment.amount / 100,

                        currency:
                            payment.currency,

                        status:
                            "captured",

                        method:
                            payment.method
                    },
                    {
                        upsert: true,
                        returnDocument: "after"
                    }
                );


                console.log(
                    "✅ Payment captured and saved to MongoDB"
                );


                // -----------------------------------------
                // CHECK WHETHER THIS IS A RETRY PAYMENT
                // -----------------------------------------

                console.log(
                    "🔄 Checking whether this is a retry payment..."
                );


                try {

                    const razorpay =
                        new Razorpay({

                            key_id:
                                process.env.RAZORPAY_KEY_ID,

                            key_secret:
                                process.env.RAZORPAY_KEY_SECRET
                        });


                    const order =
                        await razorpay.orders.fetch(
                            payment.order_id
                        );


                    const recoveryAttemptId =
                        order.notes?.recoveryAttemptId;


                    if (recoveryAttemptId) {

                        const retryAttempt =
                            await RecoveryAttempt.findById(
                                recoveryAttemptId
                            );


                        if (retryAttempt) {

                            retryAttempt.status =
                                "successful";

                            await retryAttempt.save();


                            console.log(
                                "🎉 Recovery attempt marked as successful"
                            );

                            console.log(
                                "Recovery Attempt:",
                                recoveryAttemptId
                            );

                        } else {

                            console.log(
                                "⚠️ Recovery attempt not found:",
                                recoveryAttemptId
                            );
                        }

                    } else {

                        console.log(
                            "ℹ️ No recovery attempt attached to this order"
                        );
                    }

                } catch (error) {

                    console.error(
                        "❌ Error finding retry recovery attempt:",
                        error
                    );
                }


                break;
            }


            // =========================================
            // PAYMENT FAILED
            // =========================================

            case "payment.failed": {

                const payment =
                    event.payload.payment.entity;


                // -----------------------------------------
                // SAVE FAILED PAYMENT
                // -----------------------------------------

                await Payment.findOneAndUpdate(
                    {
                        paymentId: payment.id
                    },
                    {
                        paymentId: payment.id,

                        orderId:
                            payment.order_id,

                        amount:
                            payment.amount / 100,

                        currency:
                            payment.currency,

                        status:
                            "failed",

                        method:
                            payment.method,

                        errorCode:
                            payment.error_code,

                        errorDescription:
                            payment.error_description,

                        errorReason:
                            payment.error_reason
                    },
                    {
                        upsert: true,
                        returnDocument: "after"
                    }
                );


                console.log(
                    "❌ Payment failed and saved to MongoDB"
                );


                // =========================================
                // CHECK IF THIS IS A RETRY PAYMENT
                // =========================================

                console.log(
                    "🔄 Checking whether failed payment is a retry..."
                );


                try {

                    const razorpay =
                        new Razorpay({

                            key_id:
                                process.env.RAZORPAY_KEY_ID,

                            key_secret:
                                process.env.RAZORPAY_KEY_SECRET
                        });


                    const order =
                        await razorpay.orders.fetch(
                            payment.order_id
                        );


                    const recoveryAttemptId =
                        order.notes?.recoveryAttemptId;


                    // =========================================
                    // RETRY PAYMENT FAILED
                    // =========================================

                    if (recoveryAttemptId) {

                        console.log(
                            "🔄 Failed payment belongs to recovery attempt"
                        );

                        console.log(
                            "Recovery Attempt:",
                            recoveryAttemptId
                        );


                        const recoveryAttempt =
                            await RecoveryAttempt.findById(
                                recoveryAttemptId
                            );


                        if (recoveryAttempt) {

                            recoveryAttempt.status =
                                "failed";

                            await recoveryAttempt.save();


                            console.log(
                                "❌ Recovery attempt marked as failed"
                            );

                        } else {

                            console.log(
                                "⚠️ Recovery attempt not found"
                            );
                        }


                        // -----------------------------------------
                        // DO NOT GENERATE NEW AI STRATEGY
                        // -----------------------------------------

                        console.log(
                            "⏭️ Skipping new Gemini request for retry failure"
                        );

                    }

                    // =========================================
                    // ORIGINAL PAYMENT FAILED
                    // =========================================

                    else {

                        console.log(
                            "🆕 This is an original payment failure"
                        );


                        const savedPayment =
                            await Payment.findOne({
                                paymentId:
                                    payment.id
                            });


                        // -----------------------------------------
                        // CHECK DUPLICATE RECOVERY ATTEMPT
                        // -----------------------------------------

                        const existingAttempt =
                            await RecoveryAttempt.findOne({
                                paymentId:
                                    payment.id
                            });


                        if (existingAttempt) {

                            console.log(
                                "⚠️ Recovery attempt already exists"
                            );

                            console.log(
                                "Payment ID:",
                                payment.id
                            );

                            console.log(
                                "⏭️ Skipping duplicate Gemini request"
                            );

                            break;
                        }


                        // -----------------------------------------
                        // GENERATE AI STRATEGY
                        // -----------------------------------------

                        console.log(
                            "🤖 Sending payment failure to Gemini AI..."
                        );


                        await generateRecoveryStrategy(
                            savedPayment
                        );


                        console.log(
                            "🤖 Recovery strategy generated"
                        );
                    }

                } catch (error) {

                    console.error(
                        "❌ Error processing failed payment:",
                        error
                    );
                }


                break;
            }


            // =========================================
            // PAYMENT AUTHORIZED
            // =========================================

            case "payment.authorized": {

                const payment =
                    event.payload.payment.entity;


                await Payment.findOneAndUpdate(
                    {
                        paymentId:
                            payment.id
                    },
                    {
                        paymentId:
                            payment.id,

                        orderId:
                            payment.order_id,

                        amount:
                            payment.amount / 100,

                        currency:
                            payment.currency,

                        status:
                            "authorized",

                        method:
                            payment.method
                    },
                    {
                        upsert: true,
                        returnDocument: "after"
                    }
                );


                console.log(
                    "🔐 Payment authorized and saved to MongoDB"
                );


                break;
            }


            // =========================================
            // OTHER EVENTS
            // =========================================

            default: {

                console.log(
                    "ℹ️ Event:",
                    event.event
                );

                break;
            }
        }


        // =========================================
        // RESPONSE TO RAZORPAY
        // =========================================

        return res.status(200).json({

            success: true,

            message:
                "Webhook received successfully"
        });


    } catch (error) {

        console.error(
            "❌ Webhook Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message
        });
    }
};


module.exports = {
    handleRazorpayWebhook
};