# razorrecover-ai
# 🚀 RazorRecover AI

### AI-Powered Payment Failure Recovery System

RazorRecover AI is an AI-powered payment recovery platform built for the **Razorpay AI Buildathon**. It automatically detects failed payments, analyzes the failure using AI, generates a personalized recovery strategy, and helps customers retry their payment.

The system combines **Razorpay Payments, Gemini AI, Node.js, React, and MongoDB** to create an intelligent payment recovery workflow.

---

## 🎯 Problem Statement

Payment failures are a major source of lost revenue for online businesses.

A payment can fail because of:

* Bank or card declines
* Authentication/3DS failures
* Incorrect card details
* Temporary network issues
* Payment timeouts
* User cancellation
* Other transaction-level failures

Traditional systems generally show a generic failure message and leave the customer to decide what to do next.

This can result in:

**Failed Payment → Customer Abandons → Revenue Lost**

RazorRecover AI aims to turn this into:

**Failed Payment → AI Analysis → Recovery Strategy → Retry → Successful Recovery**

---

## 💡 Solution

RazorRecover AI automatically processes failed payment events and uses AI to determine an appropriate recovery strategy.

### Recovery Flow

```text
Customer Payment
       ↓
    Razorpay
       ↓
 Payment Failure
       ↓
Razorpay Webhook
       ↓
 MongoDB
       ↓
 Gemini AI Analysis
       ↓
Failure Reason + Recovery Probability
       ↓
Recovery Strategy
       ↓
Customer Recommendation
       ↓
Retry Payment
       ↓
Razorpay Checkout
       ↓
Successful Payment
       ↓
Recovery Status Updated
       ↓
Analytics Dashboard
```

---

## 🤖 AI-Powered Recovery

Gemini AI analyzes payment failure information and generates:

* Failure reason
* Recovery probability
* Recovery priority
* Recommended recovery strategy
* Recommended action
* Customer-facing recovery message

Example:

```text
Payment Failure
       ↓
AI Analysis
       ↓
Recovery Probability: 70%
Priority: MEDIUM
Strategy: Alternative Payment Method
       ↓
Personalized Customer Message
```

The AI-generated recommendation is displayed directly on the recovery dashboard.

---

## ✨ Key Features

### 💳 Payment Processing

* Create Razorpay payment orders
* Open Razorpay Checkout
* Support INR payments
* Handle successful and failed payments

### 🔔 Webhook-Based Detection

Razorpay webhooks are used to detect payment events.

The backend processes events such as:

* `payment.failed`
* `payment.captured`

This allows the system to automatically react to payment outcomes.

### 🤖 AI Failure Analysis

Gemini AI analyzes failed transactions and generates an intelligent recovery recommendation.

### 🔄 Payment Recovery

Customers can retry failed payments directly from the dashboard.

The system creates a new Razorpay order and opens Razorpay Checkout.

### 📊 Recovery Analytics

The dashboard provides:

* Total failed payments
* Recovery attempts
* Successful recoveries
* Pending recoveries
* Recovery rate
* Total recovered amount

### 🎯 Recovery Strategies

Depending on the failure, the AI can recommend strategies such as:

* Retry Payment
* Alternative Payment Method
* Customer Re-engagement

### 💬 Customer Messaging

The system generates a customer-friendly message explaining the failure and suggesting the next action.

---

## 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │      Customer        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   React Dashboard    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Node.js + Express  │
                    │       Backend        │
                    └──────┬─────────┬─────┘
                           │         │
              ┌────────────┘         └────────────┐
              ▼                                   ▼
    ┌──────────────────┐                 ┌──────────────────┐
    │     Razorpay     │                 │    Gemini AI     │
    │ Payment Gateway  │                 │   AI Analysis    │
    └────────┬─────────┘                 └────────┬─────────┘
             │                                    │
             │ Webhooks                           │
             └──────────────┬─────────────────────┘
                            ▼
                   ┌──────────────────┐
                   │     MongoDB      │
                   │  Payment Data    │
                   │ Recovery Data    │
                   └──────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

* React.js
* JavaScript
* HTML
* CSS
* Vite

### Backend

* Node.js
* Express.js
* REST APIs

### Database

* MongoDB
* Mongoose
* MongoDB Atlas

### AI

* Google Gemini API

### Payments

* Razorpay Payment Gateway
* Razorpay Checkout
* Razorpay Webhooks

### Development Tools

* Git
* GitHub
* Postman
* VS Code

---

## 📁 Project Structure

```text
RazorRecover-AI/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   │   ├── db.js
│   │   └── razorpay.js
│   │
│   ├── controllers/
│   │   ├── analyticsController.js
│   │   ├── razorpayController.js
│   │   ├── recoveryController.js
│   │   └── webhookController.js
│   │
│   ├── models/
│   │   ├── Attempt.js
│   │   ├── Customer.js
│   │   ├── Payment.js
│   │   └── RecoveryAttempt.js
│   │
│   ├── routes/
│   │   ├── analyticsRoutes.js
│   │   ├── razorpayRoutes.js
│   │   ├── recoveryRoutes.js
│   │   └── webhookRoutes.js
│   │
│   ├── services/
│   │   ├── aiService.js
│   │   └── recoveryService.js
│   │
│   ├── app.js
│   ├── server.js
│   └── package.json
│
├── postman/
│
├── README.md
└── .gitignore
```

---

## 🔄 How It Works

### 1. Create Payment

The merchant creates a payment through the Razorpay Checkout flow.

### 2. Payment Failure

If the payment fails, Razorpay generates a payment failure event.

### 3. Webhook Processing

The backend receives the Razorpay webhook and stores the payment information in MongoDB.

### 4. AI Analysis

The failed payment information is passed to Gemini AI.

The AI determines:

```text
Failure Reason
Recovery Probability
Priority
Recovery Strategy
Recommended Action
Customer Message
```

### 5. Recovery Attempt

The recovery recommendation is displayed on the dashboard.

The customer can click:

```text
🔄 Retry Payment
```

### 6. Retry Payment

The backend creates a new Razorpay order and opens Razorpay Checkout.

### 7. Successful Recovery

If the retry succeeds, the webhook updates the recovery attempt:

```text
FAILED → SUCCESSFUL
```

The dashboard then updates the recovery analytics.

---

## 📊 Example Analytics

The dashboard provides real-time recovery metrics such as:

```text
Failed Payments       9
Recovery Attempts     8
Successful Recoveries 3
Pending Recoveries    3
Recovery Rate         37.5%
Total Recovered       ₹1,500
```

---

## 🔐 Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

GEMINI_API_KEY=your_gemini_api_key

RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

**Never commit your `.env` file or API keys to GitHub.**

---

## 🚀 Installation & Setup

### Clone the repository

```bash
git clone https://github.com/kshitisrivastava27/razorrecover-ai.git

cd razorrecover-ai
```

### Backend Setup

```bash
cd server

npm install
```

Create your `.env` file and add the required credentials.

Start the backend:

```bash
npm start
```

The backend runs on:

```text
http://localhost:5000
```

---

### Frontend Setup

Open another terminal:

```bash
cd client

npm install

npm run dev
```

The frontend will run on the Vite development URL shown in the terminal.

---

## 🧪 Testing

The application can be tested using Razorpay's test/sandbox environment.

The complete flow can be tested:

```text
Create Payment
      ↓
Simulate Payment Failure
      ↓
Webhook Received
      ↓
AI Analysis
      ↓
Recovery Recommendation
      ↓
Retry Payment
      ↓
Successful Recovery
      ↓
Analytics Updated
```

---

## 🔗 Project Links

### GitHub Repository

https://github.com/kshitisrivastava27/razorrecover-ai

### Demo Video

Coming soon.

### Live Demo

Coming soon.

---

## 🏆 Razorpay AI Buildathon

This project was developed for the **Razorpay AI Buildathon** under the AI-powered revenue/payment recovery problem space.

The goal of RazorRecover AI is to demonstrate how AI can be integrated into payment infrastructure to reduce payment failures and recover potentially lost revenue.

---

## 🔮 Future Improvements

Potential future improvements include:

* Automated recovery notifications through email/SMS
* WhatsApp-based payment recovery
* More advanced payment failure classification
* ML-based recovery probability prediction using historical data
* Automated retry scheduling
* Customer-specific recovery strategies
* Recovery performance monitoring
* Production deployment and monitoring
* A/B testing different recovery strategies

---

## 👨‍💻 Developer

**Kshiti Srivastava**

Computer Science & Engineering

---

## 📄 License

This project is created for educational and hackathon purposes.
