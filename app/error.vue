<script setup>
const props = defineProps({
    error: Object,
});

const handleError = () => clearError({ redirect: "/" });
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div class="max-w-md w-full text-center bg-white p-8 rounded-3xl border border-gray-100 shadow-xl">
            <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
                {{ error?.statusCode || 500 }}
            </div>
            <h1 class="text-xl font-bold text-gray-900 mb-2">Terjadi Kendala</h1>
            <p class="text-sm text-gray-500 mb-6">
                {{ error?.statusMessage || error?.message || 'Halaman sedang dalam pemeliharaan atau terjadi kendala sementara.' }}
            </p>
            <button
                @click="handleError"
                class="btn bg-primary hover:bg-primary-hover text-white w-full font-bold"
            >
                Kembali ke Beranda
            </button>
        </div>
    </div>
</template>
