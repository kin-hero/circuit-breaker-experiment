# Circuit Breaker Pattern Demo

A demonstration of the Circuit Breaker pattern using Node.js, Express, and the Opossum circuit breaker library.

## Overview

This project implements the Circuit Breaker pattern to handle failures gracefully when making calls to external services. The circuit breaker monitors failures and prevents cascading system failures by temporarily blocking requests to failing services.

![Circuit Breaker Pattern](Circuit%20Breaker.jpg)

## Services

### Order Service (`order.js`)
- **Port**: 3000
- Handles order creation requests
- Uses circuit breaker to call the payment service
- Circuit breaker configuration:
  - Timeout: 3 seconds
  - Error threshold: 50%
  - Reset timeout: 10 seconds

### Payment Service (`payment.js`)
- **Port**: 3001
- Simulates a payment processing service
- Can be toggled between success/failure modes for testing

## Circuit Breaker States

- 🟢 **CLOSED**: Normal operation, requests flow through
- 🔴 **OPEN**: Failure threshold reached, requests fail fast
- 🟡 **HALF-OPEN**: Testing if service has recovered

## Installation

```bash
npm install
```

## Usage

### Start Services

Start both services in separate terminals:

```bash
# Terminal 1: Start payment service
npm run payment

# Terminal 2: Start order service
npm run order
```

### Test the Circuit Breaker

1. **Test successful requests**:
   ```bash
   curl http://localhost:3000/create-order
   ```

2. **Toggle payment service to fail**:
   ```bash
   curl http://localhost:3001/toggle-failure
   ```

3. **Make requests to trigger circuit breaker**:
   ```bash
   curl http://localhost:3000/create-order
   ```

   After several failed requests, you'll see the circuit breaker open and subsequent requests will fail fast without calling the payment service.

4. **Toggle payment service back to success** and wait for the reset timeout to see the circuit breaker close again.

## Dependencies

- **express**: Web framework
- **axios**: HTTP client for service calls
- **opossum**: Circuit breaker implementation
- **nodemon**: Development dependency for auto-restart

## Key Features

- Automatic failure detection
- Fast-fail mechanism when service is down
- Configurable thresholds and timeouts
- Event listeners for monitoring circuit breaker state changes
- Graceful error handling with appropriate HTTP status codes