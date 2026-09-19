# Landz System Architecture & Blueprint

**Project**: Landz (`dotuquonline.com`)  
**Domain**: https://dotuquonline.com  
**Primary Tech Stack**: Nuxt 4, Nuxt Content v3, Tailwind CSS, DaisyUI, Nitro, Cloudflare Pages/Workers, DOKU Payment Gateway  
**Version**: 1.0.0 (Production Ready)  
**Last Updated**: 2026-09-19  

---

## 1. Executive Summary & Platform Identity

**Landz** is a high-performance, semi-static hybrid commerce and content platform designed for maximum speed, SEO visibility, and flexibility.

### Core Business Models:
1. **Affiliate & Referral Catalog**: Directing users to marketplace stores (e.g., Shopee, Tokopedia) with rich product showcases and price displays.
2. **Direct E-Commerce Checkout**: Allowing direct purchases on selected products using DOKU Jokul Payment Gateway (supporting QRIS, Virtual Accounts, E-Wallets, and Cards) without the operational overhead of a heavy monolithic e-commerce database.
3. **Automated SEO Blog & Content Engine**: AI-assisted article generation driven by trend intelligence and web scraping pipelines to capture search demand.

### Architectural Philosophy:
* **Jamstack / Semi-Static First**: Product catalogs and articles are versioned and stored as Git-backed Markdown files (`@nuxt/content` v3), enabling instant edge delivery, zero database maintenance, and immunity to typical SQL injection vulnerabilities.
* **Serverless Edge Computation**: Dynamic operations (payment token generation, webhook verification, checkout validation) run on Cloudflare Workers / Nitro Edge Runtime (`preset: "cloudflare-pages"`), ensuring global low latency and zero server idle costs.

---

## 2. High-Level Architecture Diagram

```
+---------------------------------------------------------------------------------------------------+
|                                      CLIENT BROWSER / USER                                        |
|                                                                                                   |
|   [Homepage]            [Catalog/Category]          [Product Detail (PDP)]       [Articles/Blog]  |
|   /                     /categories/[slug]          /products/[slug]             /articles/[slug] |
|                                                            |                                      |
|                                         +------------------+------------------+                   |
|                                         |                                     |                   |
|                                         v (Affiliate Mode)                    v (Direct Checkout) |
|                                 [External Marketplace]               [Checkout Page]              |
|                                 Shopee / Tokopedia / etc.            /checkout/[product]          |
|                                                                               |                   |
+-------------------------------------------------------------------------------|-------------------+
                                                                                |
                                                                        HTTP POST /api/payment/create
                                                                                |
+-------------------------------------------------------------------------------v-------------------+
|                            NITRO SERVER LAYER (Cloudflare Pages / Worker)                         |
|                                                                                                   |
|   1. Query Product Collection & Validate Real Price                                               |
|   2. Generate Unique Invoice & Store Transaction (Nitro Storage / KV)                             |
|   3. Compute SHA256 Request-Digest & HMAC-SHA256 Signature (Web Crypto API)                       |
|   4. Request Hosted Payment Session from DOKU API (/checkout/v1/payment)                          |
|                                                                                                   |
|   [Webhook Listener]  <--- HTTP POST /api/payment/callback (HMAC Signature Verified)              |
|   [Status Poller]     <--- HTTP GET  /api/payment/status?invoice=...                              |
+----------------------------------------|----------------------------------------------------------+
                                         |
                                         v
+---------------------------------------------------------------------------------------------------+
|                                   DOKU PAYMENT GATEWAY (JOKUL)                                    |
|                                                                                                   |
|   - Hosted Checkout Page (QRIS, BCA VA, Mandiri VA, BRI VA, BNI VA, OVO, ShopeePay, Cards)        |
|   - Real-time Webhook Notification Service                                                        |
+---------------------------------------------------------------------------------------------------+
```

---

## 3. Technology Stack Matrix

| Layer | Technology | Version | Purpose & Rationale |
| :--- | :--- | :--- | :--- |
| **Framework** | Nuxt 4 | `^4.3.1` | Full-stack Vue 3 framework with SSR, filesystem routing, and Nitro engine. |
| **Frontend UI** | Vue 3 | `^3.5.29` | Reactive component layer utilizing Composition API (`<script setup>`). |
| **Content Engine** | `@nuxt/content` v3 | `^3.12.0` | Git-backed Markdown content management with strict Zod schema validation. |
| **Styling & Theme** | Tailwind CSS + DaisyUI | `^6.14.0` / `^5.5.19` | Utility-first styling with custom `dotuqu` theme palette and typography. |
| **Icons** | `@phosphor-icons/vue` | `^2.2.1` | Modern icon library for rich UI feedback and badges. |
| **Server Engine** | Nitro | Built-in | Server engine generating Cloudflare Pages bundle (`_worker.js` / `dist`). |
| **Cryptography** | Web Crypto API (`crypto.subtle`) | Native W3C | Edge-compatible SHA-256 Digest & HMAC-SHA256 signature generator. |
| **Data Persistence** | Nitro Storage (`unstorage`) | Built-in | Key-Value transaction storage (`transactions:${invoiceNumber}`). |
| **Payment Gateway** | DOKU Jokul Checkout API | v1 REST | Secure PCI-DSS compliant payment processing for Indonesian payment methods. |
| **Web Scraping** | Puppeteer & Cheerio | `^24.38.0` / `^1.2.0` | Dynamic & static scraper pipeline for marketplace PDPs. |
| **AI Content** | OpenAI API | `^6.39.1` | Automated content generation, SEO rewriting, and intent extraction. |
| **SEO & Feed** | Google Trends & RSS Parser | `^4.9.2` / `^3.13.0` | Search trend monitoring and external feed syndication. |

---

## 4. Codebase & Directory Map

```
landz/
├── app/                          # Frontend Application (Nuxt 4 convention)
│   ├── assets/css/main.css       # Tailwind entry point & custom typography
│   ├── pages/
│   │   ├── index.vue             # Homepage featuring hero, categories, featured products & articles
│   │   ├── products/
│   │   │   └── [slug].vue        # Product Detail Page (Dual CTA: Affiliate vs Direct Checkout)
│   │   ├── categories/
│   │   │   └── [slug].vue        # Category archive with filtered product listings
│   │   ├── articles/
│   │   │   ├── index.vue         # Blog & article index
│   │   │   └── [slug].vue        # Article detail page with Markdown body render
│   │   ├── checkout/
│   │   │   └── [product].vue     # Checkout page capturing buyer details & creating invoice
│   │   ├── payment/
│   │   │   ├── success.vue       # Verified success receipt page with SSR guards
│   │   │   ├── pending.vue       # Waiting payment page with status verification & return links
│   │   │   └── failed.vue        # Failed/expired payment feedback
│   │   └── test-payment.vue      # Isolated sandbox test page for developer testing
├── server/                       # Server & Edge API Layer
│   ├── api/
│   │   └── payment/
│   │       ├── create.post.ts    # Initiates transaction & calls DOKU Jokul API
│   │       ├── callback.post.ts  # Webhook receiver verifying HMAC signature
│   │       └── status.get.ts     # Status polling endpoint
│   └── utils/
│       ├── doku.ts               # Universal Web Crypto implementation for DOKU signatures
│       └── storage.ts            # Nitro Storage KV abstraction for transactions
├── content/                      # Content Collections (Markdown files)
│   ├── products/                 # Product markdown files (e.g. *.md)
│   ├── categories/               # Category taxonomy metadata
│   ├── articles/                 # SEO blog articles
│   └── reviews/                  # Customer product reviews
├── content.config.ts             # Nuxt Content v3 Collection & Zod schema definitions
├── docs/                         # Project Documentation
│   ├── system-architecture.md    # Complete system blueprint (this file)
│   ├── doku-payment-integration.md # Technical API reference & security details
│   ├── doku-production-sop.md    # Production testing checklist & merchant SOP
│   └── doku-payment-audit.md     # Pre-implementation audit report
├── scripts/                      # Offline Automation & Build Tools
│   ├── articles/                 # AI content generation & trend scrapers (OpenAI + Trends)
│   ├── generate-sitemap.mjs      # Automatic sitemap.xml generator (runs before build)
│   └── getz.cjs                  # Puppeteer product scraper
├── nuxt.config.ts                # Nuxt configuration with Cloudflare Pages preset
└── tailwind.config.js            # Tailwind styling rules & DaisyUI theme setup
```

---

## 5. Core Business Workflows

### 5.1 Dual-Mode Product Routing (Affiliate vs. Direct Checkout)
Every product stored in `content/products/*.md` contains frontmatter attributes:
* **Standard Affiliate Product**: Users click `"Beli di Shopee"` (or other marketplace links) -> Redirected directly to affiliate URL.
* **Direct Checkout Product** (`isDirectCheckout: true` or dedicated direct product): Users click `"Beli Sekarang via DOKU"` -> Routed to `/checkout/[product-slug]` for native direct purchase.

### 5.2 Direct Payment & Webhook Lifecycle
1. **Initiation**: Customer submits name, email, phone, and quantity on `/checkout/[product]`.
2. **Server Handshake**: `POST /api/payment/create` fetches official price from Nuxt Content, creates internal invoice `INV-timestamp-rand`, persists transaction state as `PENDING`, generates DOKU signature, and requests payment URL.
3. **Customer Payment**: Customer is redirected to DOKU Hosted Checkout to pay via QRIS / VA / E-Wallet.
4. **Webhook Execution**: Once payment is completed, DOKU sends `POST /api/payment/callback`. The server verifies the HMAC signature and marks the invoice as `SUCCESS`.
5. **Real-time Status Delivery**:
   * If customer waits on `/payment/pending`, reactive polling detects the update and navigates automatically to `/payment/success`.
   * If customer clicks *Back to Merchant*, the route guard ensures they land on `/payment/pending` until payment confirmation is verified.

### 5.3 AI Content & Trend Automation Pipeline
* `scripts/articles/trends.cjs`: Fetches hot search queries from Google Trends API.
* `scripts/articles/ai.cjs`: Employs OpenAI GPT model to write comprehensive, SEO-optimized articles based on search queries and product categories.
* Output is formatted into standard Markdown files with frontmatter and saved directly into `content/articles/`, immediately ready for Nuxt Content parsing.

### 5.4 Automated SEO & Sitemap Generator
During every `npm run build`, `scripts/generate-sitemap.mjs` executes automatically, scanning all markdown files in `content/` and generating an up-to-date `public/sitemap.xml` with priority and freshness metadata.

---

## 6. Security & Edge Runtime Compliance

1. **Zero Node.js C++ Dependency in Edge Worker**:
   * Native C++ modules (such as `better-sqlite3` or `node:crypto`) are strictly avoided in runtime server routes.
   * Cryptographic digest and HMAC operations are powered exclusively by the W3C Web Crypto API (`crypto.subtle`), ensuring 100% compatibility with Cloudflare Workers V8 isolates.
2. **Strict Environment Variable Isolation**:
   * All secret keys (`DOKU_SECRET_KEY`, `DOKU_CLIENT_ID`, `OPENAI_API_KEY`) are managed strictly via environment variables and ignored by Git (`.gitignore`).
   * No credentials are ever exposed in client-side bundles.
3. **Signature Guarding on Webhooks**:
   * Every incoming DOKU callback is validated against the computed HMAC-SHA256 signature using the raw body, timestamp, and client ID. Unauthorized or forged requests receive HTTP 401 and are rejected.

---

## 7. Deployment & Infrastructure

* **Hosting Target**: Cloudflare Pages with Functions (`preset: "cloudflare-pages"`).
* **Build Command**: `npm run build` (Builds sitemap + compiles Nuxt into `dist/_worker.js`).
* **Output Directory**: `dist`
* **Node Version**: Node 20+ (Cloudflare Pages Build Environment).
