const { GoogleGenAI } = require("@google/genai");

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from .env");
}

const ai = new GoogleGenAI({
    apiKey: apiKey
});

const analyzePaymentFailure = async (payment) => {
    try {
        console.log("🤖 Sending payment failure to Gemini AI...");

        const prompt = `
You are an AI payment recovery assistant for a fintech application called RazorRecover AI.

Analyze this failed payment:

Payment ID: ${payment.paymentId}
Order ID: ${payment.orderId}
Amount: ₹${payment.amount}
Currency: ${payment.currency}
Payment Method: ${payment.method}
Error Code: ${payment.errorCode}
Error Description: ${payment.errorDescription}
Error Reason: ${payment.errorReason}

Return ONLY valid JSON:

{
  "failureAnalysis": "short explanation of why the payment likely failed",
  "recoveryProbability": 0,
  "recommendedAction": "retry_payment",
  "customerMessage": "short helpful message for the customer",
  "priority": "medium"
}

Rules:
- recoveryProbability must be between 0 and 100.
- recommendedAction must be one of:
  "retry_payment",
  "alternative_payment_method",
  "contact_customer",
  "manual_review"
- priority must be one of:
  "low", "medium", "high"
- Keep customerMessage professional and concise.
- Return ONLY JSON.
`;

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt
        });

        const text = response.text.trim();

        console.log("🤖 Gemini raw response:", text);

        const cleanedText = text
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();

        const result = JSON.parse(cleanedText);

        console.log("🤖 Gemini AI analysis received");

        return result;

    } catch (error) {
        console.error("❌ Gemini AI Error:", error);
        throw error;
    }
};

module.exports = {
    analyzePaymentFailure
};