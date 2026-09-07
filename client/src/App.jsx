import { useEffect, useState } from "react";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://razorrecover-ai-qqsb.onrender.com";

function App() {
  const [attempts, setAttempts] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const [error, setError] = useState("");
  const [retryingId, setRetryingId] = useState(null);

  const [paymentAmount, setPaymentAmount] = useState(500);
  const [creatingPayment, setCreatingPayment] = useState(false);

  // =========================================
  // FETCH RECOVERY ATTEMPTS
  // =========================================

  const fetchRecoveryAttempts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/recovery`
      );

      if (!response.ok) {
        throw new Error(
          `Recovery API error: ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.message || "Failed to fetch recovery attempts"
        );
      }

      setAttempts(data.attempts || []);

    } catch (err) {
      console.error(
        "❌ Error fetching recovery attempts:",
        err
      );

      setError(err.message);

    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // FETCH ANALYTICS
  // =========================================

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);

      const response = await fetch(
        `${API_URL}/api/analytics`
      );

      if (!response.ok) {
        throw new Error(
          `Analytics API error: ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.message || "Failed to fetch analytics"
        );
      }

      setAnalytics(data.analytics);

    } catch (err) {
      console.error(
        "❌ Error fetching analytics:",
        err
      );

      setAnalytics(null);

    } finally {
      setAnalyticsLoading(false);
    }
  };

  // =========================================
  // REFRESH EVERYTHING
  // =========================================

  const refreshDashboard = async () => {
    await Promise.all([
      fetchRecoveryAttempts(),
      fetchAnalytics()
    ]);
  };

  // =========================================
  // MAKE NEW PAYMENT
  // =========================================

  const makeNewPayment = async () => {
    try {
      setCreatingPayment(true);

      if (
        !paymentAmount ||
        Number(paymentAmount) <= 0
      ) {
        alert("Please enter a valid payment amount.");
        return;
      }

      console.log("💳 Creating new payment...");

      const response = await fetch(
        `${API_URL}/api/razorpay/create-order`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            amount: Number(paymentAmount),
            currency: "INR"
          })
        }
      );

      if (!response.ok) {
        throw new Error(
          `Payment API error: ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.message || "Unable to create payment"
        );
      }

      console.log(
        "✅ Razorpay order created:",
        data.order.id
      );

      // =========================================
      // CHECK RAZORPAY SCRIPT
      // =========================================

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay Checkout script is not loaded."
        );
      }

      // =========================================
      // RAZORPAY OPTIONS
      // =========================================

      const options = {
        key: data.key,

        amount: data.order.amount,

        currency: data.order.currency,

        name: "RazorRecover AI",

        description: "New Payment",

        order_id: data.order.id,

        handler: function (response) {
          console.log(
            "✅ Payment successful!"
          );

          console.log(
            "Payment ID:",
            response.razorpay_payment_id
          );

          alert(
            "Payment successful!\n\n" +
            "Payment ID: " +
            response.razorpay_payment_id
          );

          setTimeout(() => {
            refreshDashboard();
          }, 2000);
        },

        modal: {
          ondismiss: function () {
            console.log(
              "ℹ️ Razorpay Checkout closed"
            );
          }
        },

        theme: {
          color: "#3399cc"
        }
      };

      // =========================================
      // OPEN RAZORPAY CHECKOUT
      // =========================================

      const razorpay =
        new window.Razorpay(options);

      // =========================================
      // PAYMENT FAILED
      // =========================================

      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "❌ Payment failed:",
            response.error
          );

          alert(
            "Payment failed.\n\n" +
            response.error.description
          );

          setTimeout(() => {
            refreshDashboard();
          }, 2000);
        }
      );

      razorpay.open();

    } catch (err) {
      console.error(
        "❌ New payment error:",
        err
      );

      alert(
        "Unable to create payment:\n\n" +
        err.message
      );

    } finally {
      setCreatingPayment(false);
    }
  };

  // =========================================
  // RETRY PAYMENT
  // =========================================

  const retryPayment = async (attemptId) => {
    try {
      setRetryingId(attemptId);

      console.log(
        "🔄 Creating retry payment..."
      );

      const response = await fetch(
        `${API_URL}/api/recovery/${attemptId}/retry`,
        {
          method: "POST"
        }
      );

      if (!response.ok) {
        throw new Error(
          `Retry API error: ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.message || "Unable to create retry payment"
        );
      }

      console.log(
        "✅ Retry order created:",
        data.order.id
      );

      // =========================================
      // CHECK RAZORPAY
      // =========================================

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay Checkout script is not loaded."
        );
      }

      // =========================================
      // RAZORPAY OPTIONS
      // =========================================

      const options = {
        key: data.key,

        amount: data.order.amount,

        currency: data.order.currency,

        name: "RazorRecover AI",

        description: "Payment Recovery",

        order_id: data.order.id,

        handler: function (response) {
          console.log(
            "✅ Retry payment successful!"
          );

          console.log(
            "Payment ID:",
            response.razorpay_payment_id
          );

          alert(
            "Payment successfully recovered!\n\n" +
            "Payment ID: " +
            response.razorpay_payment_id
          );

          setTimeout(() => {
            refreshDashboard();
          }, 2000);
        },

        modal: {
          ondismiss: function () {
            console.log(
              "ℹ️ Razorpay Checkout closed"
            );

            setRetryingId(null);
          }
        },

        theme: {
          color: "#3399cc"
        }
      };

      const razorpay =
        new window.Razorpay(options);

      // =========================================
      // RETRY PAYMENT FAILED
      // =========================================

      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "❌ Retry payment failed:",
            response.error
          );

          alert(
            "Payment failed.\n\n" +
            response.error.description
          );

          setTimeout(() => {
            refreshDashboard();
          }, 1500);
        }
      );

      razorpay.open();

    } catch (err) {
      console.error(
        "❌ Retry payment error:",
        err
      );

      alert(
        "Unable to retry payment:\n\n" +
        err.message
      );

    } finally {
      setRetryingId(null);
    }
  };

  // =========================================
  // LOAD DASHBOARD
  // =========================================

  useEffect(() => {
    refreshDashboard();
  }, []);

  // =========================================
  // UI
  // =========================================

  return (
    <div className="dashboard">

      {/* =====================================
                    HEADER
          ===================================== */}

      <header className="header">

        <div>
          <h1>
            RazorRecover AI
          </h1>

          <p>
            Payment Recovery Dashboard
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={refreshDashboard}
          disabled={
            loading || analyticsLoading
          }
        >
          {loading || analyticsLoading
            ? "Refreshing..."
            : "Refresh"}
        </button>

      </header>


      {/* =====================================
                    MAIN
          ===================================== */}

      <main className="main">


        {/* =====================================
                    MAKE NEW PAYMENT
            ===================================== */}

        <section className="payment-section">

          <div className="dashboard-title">

            <h2>
              💳 Make New Payment
            </h2>

          </div>

          <div className="payment-box">

            <label>
              Payment Amount (₹)
            </label>

            <input
              type="number"
              min="1"
              value={paymentAmount}
              onChange={(e) =>
                setPaymentAmount(e.target.value)
              }
              placeholder="Enter amount"
            />

            <button
              className="pay-button"
              onClick={makeNewPayment}
              disabled={creatingPayment}
            >
              {creatingPayment
                ? "Creating Payment..."
                : "💳 Make Payment"}
            </button>

          </div>

        </section>


        {/* =====================================
                    ANALYTICS
            ===================================== */}

        <section className="analytics-section">

          <div className="dashboard-title">

            <h2>
              📊 Recovery Analytics
            </h2>

          </div>

          {analyticsLoading ? (

            <div className="message-box">
              Loading analytics...
            </div>

          ) : analytics ? (

            <div className="analytics-grid">

              {/* TOTAL FAILED */}

              <div className="analytics-card">

                <span className="analytics-label">
                  Failed Payments
                </span>

                <strong className="analytics-value">
                  {analytics.totalFailedPayments ?? 0}
                </strong>

              </div>


              {/* RECOVERY ATTEMPTS */}

              <div className="analytics-card">

                <span className="analytics-label">
                  Recovery Attempts
                </span>

                <strong className="analytics-value">
                  {analytics.totalRecoveryAttempts ?? 0}
                </strong>

              </div>


              {/* SUCCESSFUL */}

              <div className="analytics-card">

                <span className="analytics-label">
                  Successful Recoveries
                </span>

                <strong className="analytics-value">
                  {analytics.successfulRecoveries ?? 0}
                </strong>

              </div>


              {/* PENDING */}

              <div className="analytics-card">

                <span className="analytics-label">
                  Pending Recoveries
                </span>

                <strong className="analytics-value">
                  {analytics.pendingRecoveries ?? 0}
                </strong>

              </div>


              {/* SENT */}

              <div className="analytics-card">

                <span className="analytics-label">
                  Sent Recoveries
                </span>

                <strong className="analytics-value">
                  {analytics.sentRecoveries ?? 0}
                </strong>

              </div>


              {/* FAILED RECOVERIES */}

              <div className="analytics-card">

                <span className="analytics-label">
                  Failed Recoveries
                </span>

                <strong className="analytics-value">
                  {analytics.failedRecoveries ?? 0}
                </strong>

              </div>


              {/* RECOVERY RATE */}

              <div className="analytics-card">

                <span className="analytics-label">
                  Recovery Rate
                </span>

                <strong className="analytics-value">
                  {analytics.recoveryRate ?? 0}%
                </strong>

              </div>


              {/* RECOVERED AMOUNT */}

              <div className="analytics-card">

                <span className="analytics-label">
                  Total Recovered
                </span>

                <strong className="analytics-value">

                  ₹
                  {Number(
                    analytics.totalRecoveredAmount || 0
                  ).toLocaleString("en-IN")}

                </strong>

              </div>

            </div>

          ) : (

            <div className="message-box">

              Analytics unavailable.

            </div>

          )}

        </section>


        {/* =====================================
                    FAILED PAYMENTS
            ===================================== */}

        <section>

          <div className="dashboard-title">

            <h2>
              Failed Payments
            </h2>

            <span className="count">

              {attempts.length} Recovery Attempt
              {attempts.length !== 1
                ? "s"
                : ""}

            </span>

          </div>


          {/* LOADING */}

          {loading && (

            <div className="message-box">

              Loading recovery attempts...

            </div>

          )}


          {/* ERROR */}

          {!loading && error && (

            <div className="error-box">

              ❌ {error}

            </div>

          )}


          {/* NO PAYMENTS */}

          {!loading &&
            !error &&
            attempts.length === 0 && (

              <div className="message-box">

                No failed payments found.

              </div>

            )}


          {/* =====================================
                    RECOVERY CARDS
              ===================================== */}

          {!loading &&
            !error &&
            attempts.length > 0 && (

              <div className="cards">

                {attempts.map((attempt) => (

                  <div
                    className="recovery-card"
                    key={attempt._id}
                  >


                    {/* CARD HEADER */}

                    <div className="card-header">

                      <div>

                        <span className="label">
                          Payment ID
                        </span>

                        <p className="payment-id">
                          {attempt.paymentId}
                        </p>

                      </div>


                      <span
                        className={`status ${
                          attempt.status ===
                          "successful"
                            ? "status-success"
                            : "status-failed"
                        }`}
                      >

                        {attempt.status ===
                        "successful"
                          ? "SUCCESSFUL"
                          : "FAILED"}

                      </span>

                    </div>


                    <div className="divider"></div>


                    {/* RECOVERY SECTION */}

                    <div className="recovery-section">

                      <h3>
                        🤖 Recovery Recommendation
                      </h3>


                      {/* STRATEGY */}

                      <p className="strategy">

                        {attempt.strategy
                          ? attempt.strategy.replace(
                              /_/g,
                              " "
                            )
                          : "retry payment"}

                      </p>


                      {/* REASON */}

                      <p className="reason">

                        <strong>
                          Reason:
                        </strong>{" "}

                        {attempt.reason ||
                          "Payment could not be completed."}

                      </p>


                      {/* AI DETAILS */}

                      <div className="ai-details">

                        <div className="detail-item">

                          <span>
                            Recovery Probability
                          </span>

                          <strong>

                            {attempt.recoveryProbability ??
                              "N/A"}%

                          </strong>

                        </div>


                        <div className="detail-item">

                          <span>
                            Priority
                          </span>

                          <strong>

                            {attempt.priority
                              ?.toUpperCase() ||
                              "MEDIUM"}

                          </strong>

                        </div>

                      </div>


                      {/* RECOMMENDATION */}

                      <div className="recommendation">

                        <strong>
                          Recommended Action
                        </strong>

                        <p>
                          {attempt.recommendation ||
                            "Please retry the payment or use another payment method."}
                        </p>

                      </div>


                      {/* CUSTOMER MESSAGE */}

                      {attempt.customerMessage && (

                        <div className="customer-message">

                          <strong>
                            💬 Customer Message
                          </strong>

                          <p>
                            {attempt.customerMessage}
                          </p>

                        </div>

                      )}


                      {/* RETRY BUTTON */}

                      {attempt.status !==
                        "successful" && (

                        <div className="action-section">

                          <button
                            className="retry-button"

                            onClick={() =>
                              retryPayment(
                                attempt._id
                              )
                            }

                            disabled={
                              retryingId ===
                              attempt._id
                            }
                          >

                            {retryingId ===
                            attempt._id
                              ? "Opening Checkout..."
                              : "🔄 Retry Payment"}

                          </button>

                        </div>

                      )}


                      {/* SUCCESS MESSAGE */}

                      {attempt.status ===
                        "successful" && (

                        <div className="success-message">

                          🎉 Payment successfully recovered!

                        </div>

                      )}

                    </div>


                    {/* FOOTER */}

                    <div className="card-footer">

                      <span>

                        Status:{" "}

                        <strong>
                          {attempt.status}
                        </strong>

                      </span>


                      <span>

                        AI Generated:{" "}

                        <strong>

                          {attempt.aiGenerated
                            ? "Yes"
                            : "No"}

                        </strong>

                      </span>

                    </div>

                  </div>

                ))}

              </div>

            )}

        </section>

      </main>

    </div>
  );
}

export default App;