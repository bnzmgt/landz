// https://nuxt.com/docs/api/configuration/nuxt-config
import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

// Build-time list of content routes so every catalog page is prerendered to static HTML.
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

    nitro: {
        preset: "cloudflare-pages",
        cloudflare: {
            pages: {
                defaultRoutes: false,
                // Only route /api/* to the Worker function.
                // All other pages are served directly as ultra-fast static assets from Cloudflare's CDN.
                // This eliminates the 90s D1 timeout and 524 errors completely.
                routes: {
                    include: ["/api/*"],
                    exclude: [],
                },
            },
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
                ...contentRoutes("articles", "/articles"),
            ],
        },
        // Persistent transaction storage (Cloudflare KV)
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
        dokuEnvironment: process.env.DOKU_ENVIRONMENT || "production",
        dokuCallbackUrl: process.env.DOKU_CALLBACK_URL || "",
        dokuReturnUrl: process.env.DOKU_RETURN_URL || "",
        public: {
            maintenance: false,
        },
    },

    experimental: {
        payloadExtraction: false,
    },

    routeRules: {
        "/robots.txt": {
            headers: { "Content-Type": "text/plain" },
        },
        // Render checkout and payment status pages as client-side SPA to avoid any runtime SSR D1 calls
        "/checkout/**": { ssr: false },
        "/payment/**": { ssr: false },
        "/test-payment": { ssr: false },
        "/test": { ssr: false },
        "/api/**": { headers: { "cache-control": "no-store" } },
    },
});
