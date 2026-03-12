<script setup>
const year = new Date().getFullYear();
</script>

<template>
    <div data-theme="dotuqu" class="min-h-screen flex flex-col bg-white text-gray-900">
        <div class="bg-primary text-white text-[10px] tracking-widest uppercase py-2 text-center font-semibold">Gratis Ongkir untuk Pembelian Pertama via Link Affiliate Kami</div>

        <Navbar />

        <main class="flex-1 py-12">
            <slot />
        </main>

        <footer class="mt-10 border-t border-gray-100 py-12 text-center space-y-4">
            <h2 class="text-lg font-light tracking-[0.3em] uppercase">dotuquonline</h2>

            <div class="flex justify-center space-x-6 text-[10px] uppercase tracking-widest text-gray-400"></div>

            <p class="text-xs text-gray-400">© {{ year }} Dotuqu Online</p>
        </footer>
    </div>
</template>
