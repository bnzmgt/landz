<script setup>
const year = new Date().getFullYear();
</script>

<template>
    <div class="min-h-screen flex flex-col bg-white text-gray-900">
        <!-- ANNOUNCEMENT BAR -->
        <div class="bg-black text-white text-[10px] tracking-widest uppercase py-2 text-center font-semibold">Gratis Ongkir untuk Pembelian Pertama via Link Affiliate Kami</div>

        <!-- HEADER -->
        <header class="border-b border-gray-100 sticky top-0 bg-white z-50">
            <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <!-- LEFT MENU -->
                <nav class="flex-1 flex space-x-6 text-[11px] font-bold uppercase tracking-widest">
                    <NuxtLink to="/" class="hover:text-gray-400 transition">Home</NuxtLink>

                    <NuxtLink to="/categories/busana-muslim" class="hover:text-gray-400 transition">Categories</NuxtLink>

                    <NuxtLink to="/reviews/best-ssd-2025" class="hover:text-gray-400 transition">Reviews</NuxtLink>
                </nav>

                <!-- LOGO -->
                <div class="flex-shrink-0">
                    <NuxtLink to="/" class="text-2xl font-light tracking-[0.3em] uppercase">
                        Dotuqu
                        <span class="font-bold">Online</span>
                    </NuxtLink>
                </div>

                <!-- RIGHT ICONS -->
                <div class="flex-1 flex justify-end space-x-4">
                    <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>

                    <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </div>
            </div>
        </header>

        <!-- MAIN CONTENT -->
        <main class="flex-1 max-w-7xl mx-auto px-4 py-12">
            <slot />
        </main>

        <!-- FOOTER -->
        <footer class="mt-20 border-t border-gray-100 py-12 text-center space-y-4">
            <h2 class="text-lg font-light tracking-[0.3em] uppercase">dotuquonline</h2>

            <div class="flex justify-center space-x-6 text-[10px] uppercase tracking-widest text-gray-400"></div>

            <p class="text-xs text-gray-400">© {{ year }} Dotuqu Online</p>
        </footer>
    </div>
</template>
