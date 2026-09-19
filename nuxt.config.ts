// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    css: ["~/assets/css/main.css"],
    modules: ["@nuxtjs/tailwindcss", "@nuxt/content"],
    compatibilityDate: "2025-07-15",
    devtools: { enabled: true },
    ssr: true,

    nitro: {
        prerender: {
            crawlLinks: true,
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
    },

});
