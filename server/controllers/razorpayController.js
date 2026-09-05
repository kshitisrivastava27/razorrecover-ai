const razorpay = require("../config/razorpay");

// Create a Razorpay order
const createOrder = async (req, res) => {
    try {
        const { amount, currency = "INR" } = req.body;

        // Validate amount
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be greater than 0"
            });
        }

        // Razorpay expects amount in paise
        const options = {
            amount: Math.round(amount * 100),
            currency: currency,
            receipt: `receipt_${Date.now()}`
        };

        // Create order in Razorpay
        const order = await razorpay.orders.create(options);

        res.status(201).json({
            success: true,
            message: "Razorpay order created successfully",
            order,
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error("Razorpay Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createOrder
};