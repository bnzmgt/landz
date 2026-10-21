// https://nuxt.com/docs/api/configuration/nuxt-config
import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

// Build-time list of content routes so every catalog page is prerendered to static HTML.
// Prerendered pages do NOT depend on the Cloudflare D1 binding at runtime, which removes
// the "data hilang / tidak muncul" issue caused by failing server-side content queries.
const contentRoutes = (dir: string, prefix: string): string[] => {
    const full = join(process.cwd(), "content", dir);
    if (!existsSync(full)) return [];
    return readdirSync(full)
        .filter(f => f.endsWith(".md"))
        .map(f => `${prefix}/${f.replace(/\.md$/, "")}`);
};

export default defineNuxtConfig({
    css: ["~/assets/css/main.css"],
    modules: ["@nuxtjs/tailwindcss", "@nuxt/content"],
    compatibilityDate: "2025-07-15",
    devtools: { enabled: true },
    ssr: true,

    content: {
        // Explicit D1 binding for runtime (non-prerendered) server queries on Cloudflare.
        // The Cloudflare Pages project MUST have a D1 database bound with variable name "DB".
        database: {
            type: "d1",
            bindingName: "DB",
        },
    },

    nitro: {
        // Deployed as a Cloudflare Worker (Workers & Pages → Worker) with static assets.
        // Bindings (D1 "DB", KV "TRANSACTIONS") are declared in wrangler.jsonc.
        preset: "cloudflare_module",
        cloudflare: {
            nodeCompat: true,
        },
        prerender: {
            crawlLinks: true,
            failOnError: false,
            routes: [
                "/",
                "/articles",
                "/categories",
                ...contentRoutes("products", "/products"),
                ...contentRoutes("categories", "/categories"),
            ],
        },
        // Persistent transaction storage (Cloudflare KV). Without this, `useStorage("data")`
        // is in-memory per worker isolate and transactions disappear randomly.
        // Requires a KV namespace bound with variable name "TRANSACTIONS".
        storage: {
            data: {
                driver: "cloudflare-kv-binding",
                binding: "TRANSACTIONS",
            },
        },
        devStorage: {
            data: {
                driver: "fs",
                base: "./.data/kv",
            },
        },
    },

    runtimeConfig: {
        dokuClientId: process.env.DOKU_CLIENT_ID || "",
        dokuSecretKey: process.env.DOKU_SECRET_KEY || "",
        dokuEnvironment: process.env.DOKU_ENVIRONMENT || "sandbox",
        dokuCallbackUrl: process.env.DOKU_CALLBACK_URL || "",
        dokuReturnUrl: process.env.DOKU_RETURN_URL || "",
        public: {
            maintenance: false,
        },
    },

    experimental: {
        payloadExtraction: true,
    },

    routeRules: {
        "/robots.txt": {
            headers: { "Content-Type": "text/plain" },
        },
        // Dynamic routes must never be prerendered or cached
        "/checkout/**": { prerender: false, headers: { "cache-control": "no-store" } },
        "/payment/**": { prerender: false, headers: { "cache-control": "no-store" } },
        "/api/**": { prerender: false, headers: { "cache-control": "no-store" } },
        "/test-payment": { prerender: false },
        "/test": { prerender: false },
    },

});
