<script setup>
import { PhXCircle, PhHouse, PhArrowsClockwise } from "@phosphor-icons/vue";

const route = useRoute();
const invoiceNumber = computed(() => route.query.invoice || "");

const { data: statusData } = await useFetch(
    () => `/api/payment/status?invoice=${invoiceNumber.value}`,
    {
        immediate: Boolean(invoiceNumber.value),
    }
);

const transaction = computed(() => statusData.value?.transaction);

const formatCurrency = (val) => {
    return "Rp" + (val || 0).toLocaleString("id-ID");
};
</script>

<template>
    <div class="container mx-auto px-4 py-12 max-w-xl">
        <div class="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 text-center">
            <div class="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <PhXCircle size="48" weight="fill" />
            </div>

            <h1 class="text-2xl font-extrabold text-gray-900 mb-2">Pembayaran Gagal / Dibatalkan</h1>
            <p class="text-gray-500 text-sm mb-6">
                Mohon maaf, transaksi pembayaran Anda tidak berhasil diproses atau telah kedaluwarsa.
            </p>

            <div class="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-left space-y-3 mb-6 text-sm">
                <div class="flex justify-between border-b border-gray-200 pb-2">
                    <span class="text-gray-500">No. Invoice</span>
                    <span class="font-mono font-semibold text-gray-800">{{ transaction?.invoiceNumber || invoiceNumber || "-" }}</span>
                </div>

                <div v-if="transaction?.productName" class="flex justify-between border-b border-gray-200 pb-2">
                    <span class="text-gray-500">Produk</span>
                    <span class="font-semibold text-gray-800 text-right max-w-[200px] truncate">{{ transaction.productName }}</span>
                </div>

                <div v-if="transaction?.amount" class="flex justify-between border-b border-gray-200 pb-2">
                    <span class="text-gray-500">Total Tagihan</span>
                    <span class="font-bold text-red-500">{{ formatCurrency(transaction.amount) }}</span>
                </div>

                <div class="flex justify-between">
                    <span class="text-gray-500">Status</span>
                    <span class="badge badge-error text-white font-semibold">GAGAL / EXPIRED</span>
                </div>
            </div>

            <div class="space-y-3">
                <NuxtLink
                    v-if="transaction?.productId"
                    :to="`/checkout/${transaction.productId}`"
                    class="btn bg-primary hover:bg-primary-hover text-white w-full font-bold flex items-center justify-center gap-2"
                >
                    <PhArrowsClockwise size="20" />
                    Coba Checkout Lagi
                </NuxtLink>

                <NuxtLink to="/" class="btn btn-ghost w-full text-gray-500 flex items-center justify-center gap-2">
                    <PhHouse size="18" />
                    Kembali ke Beranda
                </NuxtLink>
            </div>
        </div>
    </div>
</template>
