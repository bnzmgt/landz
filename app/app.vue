<script setup>
useHead({
    link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
        { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
        { rel: "manifest", href: "/site.webmanifest" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
            rel: "preconnect",
            href: "https://fonts.gstatic.com",
            crossorigin: "",
        },
        {
            rel: "stylesheet",
            href: "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap",
        },
    ],
});
</script>
<template>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
</template>
