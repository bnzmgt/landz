# DOKU Payment Gateway Technical Integration Guide

**Project**: Landz (`dotuquonline.com`)  
**Gateway**: DOKU Jokul Checkout API (v1 REST)  
**Target Architecture**: Cloudflare Pages / Workers Edge Runtime + Nuxt 4 + Nitro Server  
**Document Type**: Developer Technical Reference & API Contract  
**Last Updated**: 2026-09-19  

---

## 1. System Architecture & Request Lifecycle

This integration provides a seamless direct checkout capability on top of a semi-static Nuxt 4 content platform, without requiring traditional SQL databases or heavy e-commerce backend frameworks.

```
+-----------------------------------------------------------------------------------------------+
|                                      FRONTEND (Nuxt 4 / Vue 3)                                |
|                                                                                               |
|   [Product Page]  ----->  [Checkout Form]  ---------------------------------> [Result Pages]  |
|   /products/[slug]        /checkout/[slug]                                    /payment/pending|
|                                  |                                            /payment/success|
+----------------------------------|---------------------------------------------------^--------+
                                   |                                                   |
                        HTTP POST /api/payment/create                         Polling / Auto-SSR
                                   |                                                   |
+----------------------------------v---------------------------------------------------|--------+
|                                NITRO SERVER LAYER (Cloudflare Edge Worker)           |        |
|                                                                                      |        |
|   1. Query Product Collection & Validate Price                                       |        |
|   2. Generate Invoice & Save to Nitro Storage (KV) ----------------------------------+        |
|   3. Compute SHA256 Request-Digest (Web Crypto API)                                           |
|   4. Compute HMAC-SHA256 Signature (Web Crypto API)                                          |
|   5. Call DOKU Jokul API (/checkout/v1/payment)                                               |
|                                                                                               |
|   [Webhook Listener]  <--- HTTP POST /api/payment/callback (Signature Verified)              |
+------------------------------------------|----------------------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------------------+
|                                 DOKU PAYMENT GATEWAY (JOKUL)                                  |
|                                                                                               |
|   - Hosted Payment Page (QRIS, VA Bank Transfer, E-Wallet, Credit/Debit Cards)                |
|   - Sends HTTP POST Webhook on payment state changes                                          |
+-----------------------------------------------------------------------------------------------+
```

---

## 2. Cryptographic Security & Edge Runtime Compliance

DOKU requires strict HTTP Header Authentication on all requests:
* `Client-Id`: Merchant Client ID
* `Request-Id`: Unique UUID / Random string for idempotency
* `Request-Timestamp`: ISO 8601 UTC timestamp (`YYYY-MM-DDTHH:mm:ssZ`)
* `Signature`: `HMAC-SHA256` signature string prefixed with `HMACSHA256=`

### Universal Web Crypto API (`server/utils/doku.ts`)
To ensure 100% compatibility with the Cloudflare Workers V8 Isolate runtime (where Node.js native C++ modules are unavailable), all cryptographic operations use the W3C Universal Web Crypto API (`crypto.subtle`):

#### 1. Request Digest Generation (SHA-256)
```ts
export async function generateDigest(body: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(body);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
}
```

#### 2. HMAC-SHA256 Signature Generation
```ts
export async function generateSignature(params: {
    clientId: string;
    requestId: string;
    requestTimestamp: string;
    requestTarget: string;
    digest: string;
    secretKey: string;
}): Promise<string> {
    const componentSignature =
        `Client-Id:${params.clientId}\n` +
        `Request-Id:${params.requestId}\n` +
        `Request-Timestamp:${params.requestTimestamp}\n` +
        `Request-Target:${params.requestTarget}\n` +
        `Digest:${params.digest}`;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(params.secretKey);
    const messageData = encoder.encode(componentSignature);

    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

    return `HMACSHA256=${base64Signature}`;
}
```

---

## 3. Server API Reference

### 3.1 `POST /api/payment/create`
Initiates a payment session with DOKU and returns the Hosted Checkout URL.

* **Target URL**: `/api/payment/create`
* **Method**: `POST`
* **Request Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "productId": "baju-batik-wanita-modern-single-price-test",
    "productName": "Baju Batik Wanita Modern Atasan Remaja",
    "productPrice": 10000,
    "productImage": "/images/products/batik.jpg",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "081234567890",
    "quantity": 1
  }
  ```

* **Server Internal Logic**:
  1. Validates payload fields (ensures positive amount, valid email/phone).
  2. Generates unique `invoiceNumber`: `INV-{timestamp}-{randomInt}`.
  3. Prepares internal transaction model and stores in Nitro Storage with key `transactions:${invoiceNumber}` with status `PENDING`.
  4. Generates DOKU Jokul payload (`order.amount`, `order.invoice_number`, `order.callback_url`, `order.line_items`).
  5. Computes SHA-256 digest and HMAC-SHA256 signature.
  6. Sends `POST` to DOKU endpoint:
     * Sandbox: `https://api-sandbox.doku.com/checkout/v1/payment`
     * Production: `https://api.doku.com/checkout/v1/payment`
  7. Updates transaction record with `dokuPaymentUrl` (`response.response.payment.url`).

* **Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "transactionId": "tx_1789785000_a1b2c",
    "invoiceNumber": "INV-1789785000000-123",
    "paymentUrl": "https://api-sandbox.doku.com/checkout/v1/payment/INV-...",
    "amount": 10000
  }
  ```

---

### 3.2 `POST /api/payment/callback`
Webhook notification receiver sent by DOKU when payment state updates.

* **Target URL**: `/api/payment/callback`
* **Method**: `POST`
* **Incoming Headers from DOKU**:
  * `Client-Id`
  * `Request-Id`
  * `Request-Timestamp`
  * `Signature`
* **Incoming Payload**:
  ```json
  {
    "order": {
      "invoice_number": "INV-1789785000000-123",
      "amount": 10000
    },
    "transaction": {
      "status": "SUCCESS",
      "date": "2026-09-19T10:30:00Z",
      "original_request_id": "req-...",
      "type": "PAYMENT"
    },
    "channel": {
      "id": "VIRTUAL_ACCOUNT_BCA"
    }
  }
  ```
* **Security & Processing**:
  1. Verifies the incoming `Signature` against raw body using `verifySignature()`. If invalid, responds with HTTP 401 Unauthorized.
  2. Loads existing transaction from Nitro Storage via `transactions:${invoice_number}`.
  3. Updates transaction fields:
     * `paymentStatus`: `"SUCCESS"` | `"FAILED"` | `"EXPIRED"`
     * `paymentMethod`: `channel.id`
     * `paidAt`: `transaction.date`
  4. Responds with `{ "status": "SUCCESS" }` (HTTP 200).

---

### 3.3 `GET /api/payment/status`
Queries the real-time transaction state for frontend reactive pages.

* **Target URL**: `/api/payment/status?invoice=INV-1789785000000-123`
* **Method**: `GET`
* **Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "transaction": {
      "id": "tx_1789785000_a1b2c",
      "invoiceNumber": "INV-1789785000000-123",
      "productName": "Baju Batik Wanita Modern Atasan Remaja",
      "amount": 10000,
      "quantity": 1,
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "paymentStatus": "SUCCESS",
      "dokuPaymentUrl": "https://...",
      "createdAt": "2026-09-19T03:30:00.000Z",
      "updatedAt": "2026-09-19T03:35:00.000Z"
    }
  }
  ```

---

## 4. Frontend Route & State Guarding

| Route | Guard Logic & Behavior |
| :--- | :--- |
| **`/checkout/[product]`** | Validates product exists in Nuxt Content. Submits form to `/api/payment/create`, receives `paymentUrl`, and redirects the user (`window.location.href = res.paymentUrl`). |
| **`/payment/pending`** | - Displays invoice summary, amount, customer name, and quantity.<br>- Shows **"Lanjutkan Pembayaran di DOKU"** link if invoice is not completed.<br>- Auto-redirects to `/payment/success` as soon as status switches to `SUCCESS`. |
| **`/payment/success`** | - **SSR & Client Guard**: If status is still `PENDING`, automatically redirects user back to `/payment/pending` using `navigateTo(..., { replace: true })`.<br>- Prevents premature false success when users click *Back to Merchant* before payment. |
| **`/payment/failed`** | Displays retry CTA and contact support buttons for failed or expired transactions. |
| **`/test-payment`** | Isolated developer testing sandbox (`noindex`) for mock simulation and integration checks. |

---

## 5. Nitro Storage (KV) Schema

Transactions are stored as lightweight JSON objects in Nitro Storage (`useStorage("data")`):

```ts
interface TransactionRecord {
    id: string;                    // tx_{timestamp}_{random}
    invoiceNumber: string;         // INV-{timestamp}-{random}
    productId: string;             // slug
    productName: string;           // Product title
    productPrice: number;          // Unit price (integer)
    quantity: number;              // Order quantity
    amount: number;                // Total amount (productPrice * quantity)
    customerName: string;          // Full name
    customerEmail: string;         // Email
    customerPhone: string;         // Phone
    paymentStatus: "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED";
    dokuPaymentUrl?: string;       // DOKU Checkout URL
    dokuReference?: string;        // DOKU transaction reference / ID
    paymentMethod?: string;        // E.g. "QRIS", "VIRTUAL_ACCOUNT_BCA"
    paidAt?: string;               // ISO 8601 string
    createdAt: string;             // ISO 8601 string
    updatedAt: string;             // ISO 8601 string
}
```

---

## 6. Environment Variables Reference

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `DOKU_ENVIRONMENT` | `production` / `sandbox` | Sets active DOKU API endpoint |
| `DOKU_CLIENT_ID` | `BRN-0235-1788934690111` | DOKU Merchant Client ID |
| `DOKU_SECRET_KEY` | `SK-3ILK2zplYcEPC2bna6cs` | DOKU Merchant Secret Key (HMAC signing) |
| `DOKU_CALLBACK_URL` | `https://dotuquonline.com/api/payment/callback` | Webhook receiver URL |
| `DOKU_RETURN_URL` | `https://dotuquonline.com/payment/success` | Browser return URL after checkout |
