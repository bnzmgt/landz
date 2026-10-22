# Cloudflare Pages Edge Deployment & Performance Audit Recap

**Project**: Landz (`dotuquonline.com`)  
**Domain**: https://dotuquonline.com  
**Audit Date**: October 2026  
**Document Type**: Technical Incident, Root Cause Analysis & Architectural Adjustment Report  
**Status**: Resolved & Production Verified  

---

## 1. Executive Summary

During production operations on `https://dotuquonline.com/`, the application experienced three critical issues affecting user experience, data visibility, and CI/CD deployment stability:

1. **Intermittent Missing Data / Blank Pages**: On direct URL access or hard refresh (SSR), catalog and product listings returned empty (`products=0`) with server-side HTTP 500 errors. Client-side navigation worked intermittently.
2. **Cloudflare Deployment Failure (Error 8000057)**: Cloudflare Pages builds failed at the asset publication stage due to exceeding the 100-character limit per rule in `_routes.json`.
3. **Cloudflare Gateway Timeout (Error 524)**: Requests to the homepage and catalog hung for over 90 seconds before Cloudflare severed the connection with HTTP 524.

All three issues have been diagnosed to the root cause, remediated in code and configuration, and successfully deployed to Cloudflare Pages.

---

## 2. Root Cause Analysis (RCA)

### 2.1 Missing Data & 500 Server Errors (Nuxt Content D1 Dependency)
* **Mechanism**: `@nuxt/content` v3 generates server-side SQL queries (`/__nuxt_content/*/query`) on SSR requests. In the Cloudflare Pages runtime, it expected an active D1 database bound to variable `DB`.
* **Root Cause**: The Cloudflare Pages deployment lacked the explicit D1 database binding, and the remote database had zero initialized tables (`Tables: 0`). Consequently, any server-rendered page threw `500 Server Error`. Client navigation only worked because the browser loaded pre-generated static SQL dumps (`__nuxt_content/*/sql_dump.txt`).

### 2.2 Error 8000057 (`_routes.json` 100-Character Limit)
* **Mechanism**: Cloudflare Pages enforces a hard constraint on `_routes.json`: each entry in `include` or `exclude` must be **fewer than 100 characters**, and the total number of rules cannot exceed 100.
* **Root Cause**: By default, Nitro's Cloudflare Pages preset enumerated every pre-rendered route into the `exclude` array. Multiple products in the catalog have descriptive SEO titles resulting in slugs between 110 and 241 characters (e.g., `/products/greney-black-tank-top-wanita-...-89911`). Cloudflare rejected the uploaded artifact with error:
  ```text
  Error: Failed to publish your Function. Got error: Error 8000057: Rule (%s) in `routes.json` is over the 100 character limit.
  ```

### 2.3 Error 524 Gateway Timeout (90s Initialization Loop)
* **Mechanism**: In `@nuxt/content` v3's internal server runtime (`node_modules/@nuxt/content/dist/runtime/internal/database.server.js`), the function `waitUntilDatabaseIsReady` manages database migrations with a hardcoded loop:
  ```javascript
  const REQUEST_TIMEOUT = 90;
  async function waitUntilDatabaseIsReady(db, collection) {
    // Polls database ready flag for up to 90 iterations (1 second each)
  }
  ```
* **Root Cause**: Because `_routes.json` previously included `/*`, every homepage request triggered the Worker isolate. The Worker attempted to verify the D1 database, entered `waitUntilDatabaseIsReady`, and blocked for exactly 90 seconds. Adding network handshake overhead, total execution reached **92.6 seconds**. Cloudflare's default proxy gateway timeout is 100 seconds (or less on free tiers), leading to **Error 524: A timeout occurred**.

### 2.4 Ephemeral In-Memory Transaction Loss
* **Mechanism**: Nitro's default storage (`useStorage("data")`) without explicit driver configuration used a memory `Map` fallback.
* **Root Cause**: Cloudflare Worker isolates are ephemeral and recycled frequently. As a result, transactions created in one isolate (`POST /api/payment/create`) could not be resolved by another isolate when DOKU posted webhooks or when the client polled status.

---

## 3. Technical Adjustments & Architectural Fixes

### 3.1 Static-First Edge Routing Strategy
* Instead of running SSR for all page visits, the application was re-architected to a **Static-First Jamstack** delivery model.
* In `nuxt.config.ts`, `nitro.cloudflare.pages.routes` was explicitly constrained:
  ```json
  {
    "version": 1,
    "include": ["/api/*"],
    "exclude": []
  }
  ```
* **Impact**:
  * **Static Delivery**: Homepage (`/`), products (`/products/*`), categories (`/categories/*`), and articles (`/articles/*`) are served directly from Cloudflare's Worldwide CDN Edge cache.
  * **Worker Isolation**: The Cloudflare Edge Worker function is invoked **ONLY** for dynamic payment APIs (`/api/payment/*`).
  * **Zero 524 Risk**: Content pages never execute SSR routines at runtime, completely eliminating the 90-second D1 timeout.
  * **Zero Error 8000057 Risk**: The `_routes.json` file now contains only 1 rule (`/api/*`), well within the 100-character and 100-rule limits.

### 3.2 Full Catalog Pre-Rendering
* Configured `nitro.prerender.routes` in `nuxt.config.ts` to automatically crawl and compile all markdown content in `content/products/`, `content/categories/`, and `content/articles/` into static HTML files during build time.
* Generated **55+ pre-rendered pages** into `dist/`.

### 3.3 Client-Side SPA Mode for Checkout & Payment Routes
* In `nuxt.config.ts`, `routeRules` was configured with `ssr: false` for interactive forms:
  ```typescript
  routeRules: {
    "/checkout/**": { ssr: false },
    "/payment/**": { ssr: false },
    "/test-payment": { ssr: false },
    "/api/**": { headers: { "cache-control": "no-store" } },
  }
  ```
* Checkout forms read product details directly from the client-side precomputed database (`sql_dump.txt`) and dispatch payments via `$fetch("/api/payment/create")`, bypassing server-side D1 entirely.

### 3.4 Persistent Cloudflare KV Transaction Storage
* Linked Nitro's `data` storage mount to Cloudflare Workers KV:
  ```typescript
  storage: {
    data: {
      driver: "cloudflare-kv-binding",
      binding: "TRANSACTIONS",
    },
  }
  ```
* Added `wrangler.toml` declaring the bindings for Cloudflare Pages:
  ```toml
  name = "landz"
  pages_build_output_dir = "dist"
  compatibility_date = "2025-07-15"
  compatibility_flags = ["nodejs_compat"]

  [[d1_databases]]
  binding = "DB"
  database_name = "dotuqu-content"
  database_id = "784d64b9-b956-419c-9831-68a36da73eb0"

  [[kv_namespaces]]
  binding = "TRANSACTIONS"
  id = "efe5294c796141ffaa7d8559787b095e"
  ```

### 3.5 Security Hardening & Bug Fixes
1. **Sandbox Mock Simulation Guard**: In `server/api/payment/status.get.ts`, actions `simulate_success` and `simulate_failed` are strictly disallowed when `DOKU_ENVIRONMENT === "production"` or when requests originate from `dotuquonline.com`.
2. **AsyncData Key Collision Fix**: In `app/pages/categories/index.vue`, renamed key from `"categories"` to `"categories-index-with-count"` to prevent data shape collisions with the homepage.
3. **Graceful Product Error Handling**: In `app/pages/products/[slug].vue`, added explicit `createError({ statusCode: 404 })` and `503` handling instead of rendering silent empty shells.
4. **Node Version Pinning**: Created `.nvmrc` and `.node-version` pinning Node.js to `22` for consistent builds in Cloudflare's environment.

---

## 4. Performance & Reliability Comparison

| Metric | Before Optimization | After Optimization |
| :--- | :--- | :--- |
| **Homepage TTFB / Latency** | 92,663 ms (or 524 Timeout) | **~15 – 45 ms** |
| **Catalog SSR Rendering** | HTTP 500 (`products=0`) | **HTTP 200 (14+ products static)** |
| **Cloudflare Pages Build** | Failed (`Error 8000057`) | **Success (Published in ~1m 30s)** |
| **D1 Runtime Coupling** | Blocked on runtime queries | **Decoupled (Build-time compilation)** |
| **Transaction Persistence** | Ephemeral memory (Lost on restart) | **Distributed Cloudflare KV Storage** |
| **Simulation Endpoint Security** | Open to query param bypass | **Guarded (Sandbox-only execution)** |

---

## 5. Maintenance & Operational Guidelines

1. **Adding New Products**:
   * Add the Markdown file to `content/products/<slug>.md`.
   * Push to `master`. The pre-renderer will automatically compile the new product into static HTML and include it in `sitemap.xml`.
2. **Cloudflare Pages Configuration**:
   * Project Type: **Cloudflare Pages** (connected to GitHub repository `bnzmgt/landz`).
   * Build Command: `npm run build`
   * Build Output Directory: `dist`
   * Root Directory: `/`
3. **Checking Edge Health**:
   ```bash
   # Verify homepage responds fast and contains catalog data
   curl -s -w "\nHTTP: %{http_code} | Time: %{time_total}s\n" https://dotuquonline.com/ | tail -5
   ```
