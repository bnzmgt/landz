<template>
    <div class="min-h-screen flex flex-col">
        <!-- Navbar -->
        <header class="navbar bg-base-100 shadow">
            <div class="container mx-auto">
                <!-- Logo -->
                <div class="flex-1">
                    <NuxtLink to="/" class="text-xl font-bold">AffiliateSite</NuxtLink>
                </div>

                <!-- Navigation -->
                <nav class="flex gap-6">
                    <NuxtLink to="/" class="link link-hover">Home</NuxtLink>

                    <NuxtLink to="/categories/ssd" class="link link-hover">Categories</NuxtLink>

                    <NuxtLink to="/reviews/best-ssd-2025" class="link link-hover">Reviews</NuxtLink>
                </nav>
            </div>
        </header>

        <!-- Main Content -->
        <main class="flex-1 container mx-auto py-10">
            <slot />
        </main>

        <!-- Footer -->
        <footer class="footer footer-center p-6 bg-base-200">
            <p>© {{ year }} Affiliate Site</p>
        </footer>
    </div>
</template>

<script setup>
const year = new Date().getFullYear();
</script>
