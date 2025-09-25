import express from "express";
import axios from "axios";
import Opossum from "opossum";

const app = express();
const PORT = 3000;

// The remote URL for our payment service
const PAYMENT_SERVICE_URL = "http://localhost:3001/process-payment";

// -- Circuit Breaker Configuration --
const options = {
  timeout: 3000, // If the function takes longer than 3 seconds, trigger a failure
  errorThresholdPercentage: 50, // If 50% of requests fail, trip the circuit
  resetTimeout: 10000, // After 10 seconds, move to Half-Open state
};

// This is the function that makes the actual network call
async function callPaymentService(orderData) {
  // In a real app, you'd pass orderData in the request body
  return axios.post(PAYMENT_SERVICE_URL, { data: orderData });
}

// Wrap our network call function with the Opossum circuit breaker
const breaker = new Opossum(callPaymentService, options);

// --- Express Routes ---
app.get("/create-order", async (req, res) => {
  try {
    console.log("Attempting to create order and process payment...");
    // Instead of calling callPaymentService() directly, we call breaker.fire()
    const result = await breaker.fire({ orderId: "abc987", amount: 100 });

    // This code only runs if the breaker call was successful
    console.log("Payment call successful via breaker.");
    res.status(200).json({
      message: "Order created successfully!",
      paymentInfo: result.data,
    });
  } catch (error) {
    // This block catches errors from the breaker.
    // If the circuit is OPEN, the error comes from the breaker instantly
    // without a network call.
    console.error("Payment call failed via breaker:", error.message);
    res.status(503).json({
      message: "Service Unavailable. Please try again later.",
      error: error.message,
    });
  }
});

// Event listeners to see the breaker's state changes in the console
breaker.on("open", () => console.log("🔴 Breaker is OPEN. Calls will fail fast."));
breaker.on("halfOpen", () => console.log("🟡 Breaker is HALF-OPEN. Probing with one call."));
breaker.on("close", () => console.log("🟢 Breaker is CLOSED. Calls are flowing normally."));

app.listen(PORT, () => {
  console.log(`🛍️ Order Service listening on port ${PORT}`);
});
