import express from "express";

const app = express();
const PORT = 3001;

// A switch to simulate failure
let shouldFail = false;

// An endpoint to make the service fail or succeed
app.get("/toggle-failure", (req, res) => {
  shouldFail = !shouldFail;
  res.send(`Payment service will now ${shouldFail ? "FAIL" : "SUCCEED"}.`);
});

// The actual payment processing endpoint
app.post("/process-payment", (req, res) => {
  console.log(`Received payment request. Current status: ${shouldFail ? "Failing" : "Succeeding"}`);
  if (shouldFail) {
    console.log("Payment failed intentionally.");
    // Return a server error status
    res.status(500).json({ message: "Payment Processor Error" });
  } else {
    console.log("Payment processed successfully.");
    res.status(200).json({ message: "Payment Successful!", transactionId: "xyz123" });
  }
});

app.listen(PORT, () => {
  console.log(`💳 Payment Service listening on port ${PORT}`);
  console.log("Endpoint to toggle failure: GET http://localhost:3001/toggle-failure");
});
