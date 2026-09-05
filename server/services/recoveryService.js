const RecoveryAttempt = require("../models/RecoveryAttempt");
const { analyzePaymentFailure } = require("./aiService");

const generateRecoveryStrategy = async (payment) => {
    try {
        console.log("🤖 Sending payment failure to Gemini AI...");

        const aiResult = await analyzePaymentFailure(payment);

        console.log("🤖 Gemini AI analysis received");

        const recoveryAttempt = await RecoveryAttempt.create({
            paymentId: payment.paymentId,

            strategy: aiResult.recommendedAction,

            reason: aiResult.failureAnalysis,

            recommendation: aiResult.customerMessage,

            recoveryProbability: aiResult.recoveryProbability,

            priority: aiResult.priority,

            customerMessage: aiResult.customerMessage,

            status: "pending",

            aiGenerated: true
        });

        console.log("✅ AI recovery strategy saved to MongoDB");

        return recoveryAttempt;

    } catch (error) {
        console.error(
            "❌ Recovery strategy generation failed:",
            error
        );

        throw error;
    }
};

module.exports = {
    generateRecoveryStrategy
};