# DOKU Payment Integration Audit Report

**Project**: Landing Bismillah (`landz`)  
**Date**: 2026-09-18  
**Scope**: Pre-implementation audit for DOKU Payment Gateway integration without breaking the semi-static architecture.

---

## 1. Current Condition

### 1.1 Nuxt Structure
* **Nuxt Version**: Nuxt 4 (`^4.3.1`) with Vue 3 (`^3.5.29`).
* **Source Folder Convention**: `app/` folder is used for frontend components, composables, layouts, middleware, and pages (`app/pages/products/[slug].vue`).
* **Server Layer**: Currently, no `server/` directory exists. All product data is queried client-side/SSR via Nuxt Content v3 composable `queryCollection('products')`.
* **Styling**: Tailwind CSS with DaisyUI (`dotuqu` theme) and Phosphor Icons Vue.

### 1.2 Product Content Structure
* **Content Engine**: Nuxt Content v3 with Zod schema defined in `content.config.ts`.
* **Product Schema**:
  ```ts
  schema: z.object({
      title: z.string(),
      slug: z.string(),
      price: z.string(), // Example: "Rp49.000" (string formatted with currency prefix)
      image: z.string(),
      affiliate: z.string(),
      category: z.string(),
      rating: z.number().optional(),
      brand: z.string().optional(),
  })
  ```
* **Price Representation**: Price is stored as a formatted string (e.g. `"Rp49.000"`). It must be parsed to integer (e.g. `49000`) before sending to payment gateway.
* **Call To Action (CTA)**: Existing CTA directs users to external affiliate links (`affiliate: "https://s.shopee.co.id/..."`).

### 1.3 Deployment & Runtime Target
* **Serverless / Edge Target**: Targeted for Cloudflare Workers / Nitro server engine.
* **Database in `package.json`**: `better-sqlite3` is present in dependencies. However, native C++ bindings do not run on Cloudflare Workers edge runtime (V8 isolates).

---

## 2. Required Adjustments

1. **Server API Layer (`server/`)**:
   * Create `server/api/payment/create.post.ts` for secure payment initiation and signature generation.
   * Create `server/api/payment/callback.post.ts` for webhook notification handling and signature verification.
   * Create `server/api/payment/status.get.ts` for client status polling/query.
   * Create `server/utils/doku.ts` for HMAC-SHA256 signature generator, request digest, and API caller compatible with standard Web Crypto / Node crypto.

2. **Transaction Persistence Layer**:
   * Implement Nitro Storage (`useStorage('transactions')` / Unstorage) abstraction.
   * Enables zero-config in-memory/filesystem storage during local development and seamless compatibility with Cloudflare KV / D1 / memory in production without native binary dependencies.

3. **Frontend Checkout & Payment Results**:
   * Create `/checkout/[product]` page to display selected item summary, buyer input (name/email/phone for payment notification), and payment trigger.
   * Create `/payment/success`, `/payment/pending`, and `/payment/failed` feedback pages.
   * Add optional "Beli Sekarang / Direct Buy" CTA button in addition to existing affiliate button on product page or checkout flow.

4. **Testing Route (`/test-payment`)**:
   * Add isolated route `/test-payment` providing end-to-end sandbox testing without modifying existing production products or sitemap.

---

## 3. Potential Limitations & Mitigations

| Potential Limitation | Risk | Mitigation |
| :--- | :--- | :--- |
| **Price Format Mismatch** | `price` is formatted as string `"Rp49.000"`. DOKU requires integer amount (e.g. `49000`). | Server sanitizer utility to strip non-digit characters (`price.replace(/[^\d]/g, '')`). |
| **Native Binary Incompatibility** | `better-sqlite3` will crash on Cloudflare Workers edge. | Use Nitro Unstorage / `useStorage('data')` or RESTful storage adapter instead of direct `better-sqlite3` for edge deployment. |
| **Credential Security** | Leaking Client Secret to client bundle. | Strictly isolate DOKU API calls, HMAC generation, and Secret Key inside `server/` routes with `runtimeConfig`. |
| **Webhook Delivery in Local Dev** | DOKU cannot reach `localhost` directly for webhooks without tunneling. | In sandbox/local test, support direct payment status check endpoint & redirect fallback, while keeping callback endpoint ready for webhook simulation (e.g., via ngrok / curl). |
