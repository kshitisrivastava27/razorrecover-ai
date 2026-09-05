import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [attempts, setAttempts] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const [error, setError] = useState("");
  const [retryingId, setRetryingId] = useState(null);

  // =========================================
  // NEW PAYMENT STATES
  // =========================================

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
        "http://localhost:5000/api/recovery"
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setAttempts(data.attempts);

    } catch (err) {
      console.error(
        "Error fetching recovery attempts:",
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
        "http://localhost:5000/api/analytics"
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setAnalytics(data.analytics);

    } catch (err) {
      console.error(
        "Error fetching analytics:",
        err
      );

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

      // -----------------------------------------
      // VALIDATE AMOUNT
      // -----------------------------------------

      if (
        !paymentAmount ||
        Number(paymentAmount) <= 0
      ) {
        alert("Please enter a valid amount.");
        return;
      }

      console.log(
        "💳 Creating new payment..."
      );

      // -----------------------------------------
      // CREATE RAZORPAY ORDER
      // -----------------------------------------

      const response = await fetch(
        "http://localhost:5000/api/razorpay/create-order",
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

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      console.log(
        "✅ New Razorpay order created:",
        data.order.id
      );

      // -----------------------------------------
      // CHECK RAZORPAY SCRIPT
      // -----------------------------------------

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay Checkout script is not loaded."
        );
      }

      // -----------------------------------------
      // RAZORPAY CHECKOUT OPTIONS
      // -----------------------------------------

      const options = {
        key: data.key,

        amount: data.order.amount,

        currency: data.order.currency,

        name: "RazorRecover AI",

        description: "New Payment",

        order_id: data.order.id,

        // ---------------------------------------
        // PAYMENT SUCCESS
        // ---------------------------------------

        handler: function (response) {
          console.log(
            "✅ New payment successful!"
          );

          console.log(
            "Payment ID:",
            response.razorpay_payment_id
          );

          console.log(
            "Order ID:",
            response.razorpay_order_id
          );

          console.log(
            "Signature:",
            response.razorpay_signature
          );

          alert(
            "Payment successful!\n\n" +
            "Payment ID: " +
            response.razorpay_payment_id
          );

          // Give Razorpay webhook time
          // to update MongoDB

          setTimeout(() => {
            refreshDashboard();
          }, 1500);
        },

        // ---------------------------------------
        // CHECKOUT CLOSED
        // ---------------------------------------

        modal: {
          ondismiss: function () {
            console.log(
              "ℹ️ Razorpay Checkout closed"
            );
          }
        },

        // ---------------------------------------
        // THEME
        // ---------------------------------------

        theme: {
          color: "#3399cc"
        }
      };

      // -----------------------------------------
      // CREATE RAZORPAY INSTANCE
      // -----------------------------------------

      const razorpay =
        new window.Razorpay(options);

      // -----------------------------------------
      // PAYMENT FAILURE
      // -----------------------------------------

      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "❌ New payment failed:",
            response.error
          );

          alert(
            "Payment failed.\n\n" +
            response.error.description
          );

          // Refresh dashboard after failure
          // because webhook may create AI recovery

          setTimeout(() => {
            refreshDashboard();
          }, 1500);
        }
      );

      // -----------------------------------------
      // OPEN CHECKOUT
      // -----------------------------------------

      razorpay.open();

    } catch (error) {
      console.error(
        "❌ New payment error:",
        error
      );

      alert(
        "Unable to create payment:\n\n" +
        error.message
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

      // -----------------------------------------
      // CALL BACKEND
      // -----------------------------------------

      const response = await fetch(
        `http://localhost:5000/api/recovery/${attemptId}/retry`,
        {
          method: "POST"
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      console.log(
        "✅ Retry order created:",
        data.order.id
      );

      // -----------------------------------------
      // CHECK RAZORPAY SCRIPT
      // -----------------------------------------

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay Checkout script is not loaded."
        );
      }

      // -----------------------------------------
      // RAZORPAY OPTIONS
      // -----------------------------------------

      const options = {
        key: data.key,

        amount: data.order.amount,

        currency: data.order.currency,

        name: "RazorRecover AI",

        description: "Payment Recovery",

        order_id: data.order.id,

        // ---------------------------------------
        // PAYMENT SUCCESS
        // ---------------------------------------

        handler: function (response) {
          console.log(
            "✅ Retry payment successful!"
          );

          console.log(
            "Payment ID:",
            response.razorpay_payment_id
          );

          console.log(
            "Order ID:",
            response.razorpay_order_id
          );

          console.log(
            "Signature:",
            response.razorpay_signature
          );

          alert(
            "Payment successful!\n\n" +
            "Payment ID: " +
            response.razorpay_payment_id
          );

          // Give webhook time
          // to update MongoDB

          setTimeout(() => {
            refreshDashboard();
          }, 1500);
        },

        // ---------------------------------------
        // CHECKOUT CLOSED
        // ---------------------------------------

        modal: {
          ondismiss: function () {
            console.log(
              "ℹ️ Razorpay Checkout closed"
            );

            setRetryingId(null);
          }
        },

        // ---------------------------------------
        // THEME
        // ---------------------------------------

        theme: {
          color: "#3399cc"
        }
      };

      // -----------------------------------------
      // CREATE RAZORPAY INSTANCE
      // -----------------------------------------

      const razorpay =
        new window.Razorpay(options);

      // -----------------------------------------
      // PAYMENT FAILURE
      // -----------------------------------------

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
          }, 1000);
        }
      );

      // -----------------------------------------
      // OPEN CHECKOUT
      // -----------------------------------------

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
            loading ||
            analyticsLoading
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

        <section className="new-payment-section">

          <div className="dashboard-title">

            <h2>
              💳 Make New Payment
            </h2>

          </div>


          <div className="new-payment-card">

            <div className="payment-input-group">

              <label htmlFor="paymentAmount">
                Payment Amount (₹)
              </label>

              <input
                id="paymentAmount"
                type="number"
                min="1"
                value={paymentAmount}
                onChange={(e) =>
                  setPaymentAmount(
                    e.target.value
                  )
                }
                placeholder="Enter amount"
              />

            </div>


            <button
              className="pay-button"
              onClick={makeNewPayment}
              disabled={creatingPayment}
            >

              {creatingPayment
                ? "Creating Payment..."
                : "💳 Pay with Razorpay"}

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
                  {analytics.totalFailedPayments}
                </strong>

              </div>


              {/* RECOVERY ATTEMPTS */}

              <div className="analytics-card">

                <span className="analytics-label">
                  Recovery Attempts
                </span>

                <strong className="analytics-value">
                  {analytics.totalRecoveryAttempts}
                </strong>

              </div>


              {/* SUCCESSFUL */}

              <div className="analytics-card">

                <span className="analytics-label">
                  Successful Recoveries
                </span>

                <strong className="analytics-value">
                  {analytics.successfulRecoveries}
                </strong>

              </div>


              {/* PENDING */}

              <div className="analytics-card">

                <span className="analytics-label">
                  Pending Recoveries
                </span>

                <strong className="analytics-value">
                  {analytics.pendingRecoveries}
                </strong>

              </div>


              {/* RECOVERY RATE */}

              <div className="analytics-card">

                <span className="analytics-label">
                  Recovery Rate
                </span>

                <strong className="analytics-value">
                  {analytics.recoveryRate}%
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

                        {attempt.reason}

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

                            {attempt.priority?.toUpperCase() ||
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
                          {attempt.recommendation}
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