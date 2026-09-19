# DOKU Payment Gateway Production SOP & Testing Guideline

**Project**: Landz (`dotuquonline.com`)  
**Target Audience**: QA Tester, Store Operator, Merchant Administrator, Developer  
**Environment**: Production (`https://dotuquonline.com`)  
**Last Updated**: 2026-09-19  

---

## 1. DOKU Merchant Dashboard Setup (One-Time Configuration)

Before running live production transactions, ensure the DOKU Merchant Back Office is properly configured:

### 1.1 Webhook Notification URL
1. Login to **DOKU Back Office / Dashboard** ([https://dashboard.doku.com](https://dashboard.doku.com)).
2. Navigate to **Settings** > **Payment Configuration** > **Notification URL / Webhook**.
3. Set the **Payment Notification URL** to:
   ```
   https://dotuquonline.com/api/payment/callback
   ```
4. Set **Notification Method** to: `POST (JSON)`.
5. Ensure signature verification is active with the corresponding **Secret Key**.

### 1.2 Return / Redirect URL
1. In the DOKU Dashboard, navigate to **Hosted Checkout Settings** > **URLs**.
2. Set **Return URL (Success)** to:
   ```
   https://dotuquonline.com/payment/success
   ```
3. Set **Back to Merchant URL / Cancel URL** to:
   ```
   https://dotuquonline.com/payment/pending
   ```

---

## 2. Production Testing Checklist (End-to-End Scenarios)

Use the dedicated test product:  
👉 `https://dotuquonline.com/products/baju-batik-wanita-modern-single-price-test` (Nominal: Rp10.000)

---

### Scenario A: Successful Live Payment (QRIS / Virtual Account)
* **Objective**: Verify that a real customer payment updates the transaction status from `PENDING` to `SUCCESS` in real time.
* **Test Steps**:
  1. Open the test product page: `https://dotuquonline.com/products/baju-batik-wanita-modern-single-price-test`.
  2. Click **"Beli Sekarang via DOKU"**.
  3. On the Checkout page (`/checkout/...`), enter:
     * **Nama Lengkap**: Tester Name
     * **Email**: `your-real-email@example.com`
     * **No. WhatsApp**: `0812xxxxxxxx`
     * **Jumlah**: `1`
  4. Click **"Lanjutkan ke Pembayaran DOKU"**.
  5. Verify you are redirected to the official DOKU hosted page (`https://api.doku.com/checkout/...`).
  6. Choose **QRIS** or **BCA / Mandiri / BRI Virtual Account**.
  7. Make a real payment of Rp10.000 using your mobile banking or e-wallet app.
  8. Once paid, click **"Kembali ke Merchant"** or wait for automatic redirect.
* **Expected Result**:
  * The user is redirected to `https://dotuquonline.com/payment/success?invoice=INV-...`.
  * The page displays **"Pembayaran Berhasil!"** with green badge `PAID / SUKSES`.
  * Invoice number, buyer name, product name, quantity, and total payment are accurately rendered.
  * In the DOKU Merchant Dashboard, the transaction status is marked as **SETTLEMENT / SUCCESS**.

---

### Scenario B: "Back to Merchant" Before Payment (Pending State Verification)
* **Objective**: Ensure the system does NOT display a false success page if a buyer abandons or delays payment.
* **Test Steps**:
  1. Initiate checkout for the test product.
  2. On the DOKU payment page, **do NOT complete the payment**.
  3. Click **"Back to Merchant"** (or return button on top/bottom of DOKU checkout).
* **Expected Result**:
  * The user lands on `https://dotuquonline.com/payment/pending?invoice=INV-...`.
  * The page displays **"Menunggu Pembayaran"** with an amber `PENDING` badge.
  * The yellow "Mode Sandbox" test box is **NOT** visible in production.
  * The button **"Lanjutkan Pembayaran di DOKU"** is present and clicking it returns the user directly to their active DOKU invoice.
  * The button **"Cek Status Pembayaran"** allows manually querying status updates.

---

### Scenario C: Payment Expiration / Timeout
* **Objective**: Confirm behavior when an unpaid invoice expires after its 1-hour window.
* **Test Steps**:
  1. Create a transaction on DOKU Checkout.
  2. Leave the transaction unpaid until the expiry period (default: 60 minutes) elapses.
* **Expected Result**:
  * DOKU sends an expiration webhook notification.
  * Querying `/payment/pending` or `/api/payment/status` updates the state to `EXPIRED`.
  * Navigating to the invoice displays `/payment/failed` with an option to create a new order.

---

## 3. SOP: Enabling Direct DOKU Checkout on New Products

By default, products in Landz act as affiliate showcase items directing users to marketplace URLs (e.g. Shopee). To enable direct DOKU checkout for a product:

1. Open or create the target product markdown file in `content/products/<slug>.md`.
2. Ensure the frontmatter contains:
   ```markdown
   ---
   title: "Nama Produk Anda"
   slug: "nama-produk-anda"
   price: "Rp49.000"
   image: "/images/products/sample.jpg"
   affiliate: "https://s.shopee.co.id/..."
   category: "pakaian-wanita"
   isDirectCheckout: true
   ---
   ```
3. Commit and push the markdown file to `master`.
4. Cloudflare Pages will build the updated catalog. The product page `/products/nama-produk-anda` will automatically display the **"Beli Sekarang via DOKU"** button directing to `/checkout/nama-produk-anda`.

---

## 4. Troubleshooting & Operational Error Catalog

| Issue / Error | Root Cause | Solution |
| :--- | :--- | :--- |
| **HTTP 405 on `POST /api/payment/create`** | Cloudflare Pages deployed as purely static site without Functions worker. | Verify `preset: "cloudflare-pages"` is in `nuxt.config.ts` and build command in Cloudflare is `npm run build` with output directory `dist`. |
| **HTTP 401 Unauthorized on Webhook Callback** | Secret Key mismatch or altered payload during signature verification. | 1. Check that `DOKU_SECRET_KEY` in Cloudflare Pages Environment Variables matches DOKU Production Dashboard.<br>2. Ensure no reverse-proxy modifies the raw JSON body. |
| **Customer Paid but Status Stuck on "PENDING"** | Webhook callback URL unreachable or blocked by Cloudflare WAF. | 1. Check DOKU Dashboard > **Notification Logs** for HTTP response code.<br>2. Ensure `https://dotuquonline.com/api/payment/callback` is allowed in Cloudflare Security/WAF rules. |
| **`crypto.subtle` / Crypto Error in Logs** | Node.js native crypto import executed on Cloudflare Workers edge. | Ensure all signing logic imports `server/utils/doku.ts` which uses standard Web Crypto API. |
| **User sees Sandbox yellow simulation box in Production** | `isMock` condition misconfigured. | Fixed in commit `b858358`. Kotak kuning hanya aktif bila URL sengaja diakses dengan `?mock=true`. |
