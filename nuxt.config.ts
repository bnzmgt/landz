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
