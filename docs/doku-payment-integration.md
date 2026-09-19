# DOKU Payment Gateway Integration Guide

**Project**: Landing Bismillah (`landz`)  
**Architecture**: Semi-Static Content Platform + Nitro Server API + DOKU Checkout  
**Date**: 2026-09-18

---

## 1. Architecture Overview

This integration provides a direct, minimal checkout capability for products managed in Nuxt Content v3 markdown files without turning the project into a heavy monolithic e-commerce system.

```
+-------------------------------------------------------------------+
|                        Nuxt 4 Frontend                            |
|                                                                   |
|   [Product Page]  ----->  [Checkout Page]  ----->  [Result Pages] |
|   /products/[slug]        /checkout/[slug]         /payment/success
+-----------------------------------|-------------------------------+
                                    |
                            HTTP POST /api/payment/create
                                    |
+-----------------------------------|-------------------------------+
|                        Nitro Server Layer                         |
|                                                                   |
|   1. Validate Product & Price                                     |
|   2. Generate Invoice & Transaction (Nitro Storage)               |
|   3. Compute SHA256 Digest & HMAC-SHA256 Signature                |
|   4. Request DOKU Checkout Session (/checkout/v1/payment)         |
+-----------------------------------|-------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------+
|                      DOKU Payment Gateway                         |
|                                                                   |
|   - Hosted Payment Page (QRIS, VA, E-Wallet, Card)                |
|   - Sends HTTP POST Webhook -> /api/payment/callback              |
+-------------------------------------------------------------------+
```

---

## 2. Environment Variables

Configure the following variables in `.env` for local development or in Cloudflare Pages / Worker Environment Variables for production:

```env
# DOKU Environment ('sandbox' or 'production')
DOKU_ENVIRONMENT=sandbox

# DOKU Merchant Credentials
DOKU_CLIENT_ID=YOUR_DOKU_CLIENT_ID
DOKU_SECRET_KEY=YOUR_DOKU_SECRET_KEY

# Webhook Callback URL
DOKU_CALLBACK_URL=https://your-domain.com/api/payment/callback

# Return URL
DOKU_RETURN_URL=https://your-domain.com/payment/success
```

---

## 3. Server API Endpoints

### 3.1 `POST /api/payment/create`
Initiates a new payment request and returns the DOKU payment redirect URL.
* **Payload**:
  ```json
  {
    "productId": "baju-batik-wanita-modern",
    "productName": "Baju Batik Wanita Modern",
    "productPrice": 49000,
    "productImage": "https://...",
    "customerName": "Budi Santoso",
    "customerEmail": "budi@example.com",
    "customerPhone": "08123456789",
    "quantity": 1
  }
  ```
* **Response**:
  ```json
  {
    "success": true,
    "transactionId": "tx_1710000000_abcde",
    "invoiceNumber": "INV-1710000000-123",
    "paymentUrl": "https://api-sandbox.doku.com/checkout/v1/payment/...",
    "amount": 49000
  }
  ```

### 3.2 `POST /api/payment/callback`
Webhook endpoint receiving HTTP notifications from DOKU when a payment state changes.
* Verifies HMAC-SHA256 signature using `DOKU_SECRET_KEY`.
* Updates transaction record status (`SUCCESS`, `FAILED`, `EXPIRED`).
* Responds with `{ "status": "SUCCESS" }` (HTTP 200).

### 3.3 `GET /api/payment/status`
Queries transaction status by invoice or internal ID.
* **Query**: `?invoice=INV-1710000000-123`
* **Response**:
  ```json
  {
    "success": true,
    "transaction": {
      "invoiceNumber": "INV-1710000000-123",
      "paymentStatus": "SUCCESS",
      "amount": 49000,
      "productName": "Baju Batik Wanita Modern"
    }
  }
  ```

---

## 4. Frontend Routes

| Route | Purpose | Public / Private |
| :--- | :--- | :--- |
| `/checkout/[product]` | Checkout form for specified product slug. | Public |
| `/payment/success` | Success feedback page with invoice summary. | Public |
| `/payment/pending` | Waiting payment page with status verification. | Public |
| `/payment/failed` | Failed/expired payment feedback with retry. | Public |
| `/test-payment` | Isolated end-to-end sandbox testing suite. | Private (`noindex`) |

---

## 5. Testing Procedure

### 5.1 Local Testing with Mock Mode
1. Run `npm run dev`.
2. Open `http://localhost:3000/test-payment`.
3. Click **Test Checkout API**.
4. Test the webhook simulator button to verify real-time status updates from `PENDING` to `SUCCESS` or `FAILED`.

### 5.2 Real DOKU Sandbox Testing
1. Fill in valid sandbox credentials in `.env` (`DOKU_CLIENT_ID` and `DOKU_SECRET_KEY`).
2. Run `npm run dev`.
3. Trigger checkout either from `/test-payment` or any product page `/products/[slug]`.
4. The user will be redirected to the official DOKU Sandbox checkout page.
5. Complete sandbox payment using test QRIS or test Virtual Account credentials.

---

## 6. Known Limitations & Recommendations

1. **Local Webhook Receipt**: DOKU cannot reach `localhost:3000` directly. For live local webhook tests, use tunneling tools like `ngrok` or Cloudflare Tunnel:
   ```bash
   ngrok http 3000
   ```
2. **Edge Compatibility**: Transactions use Nitro Storage (`unstorage`), ensuring seamless compatibility across Node.js, Vercel, and Cloudflare Workers runtime without native binary dependencies (`better-sqlite3` is avoided in server API routes).
