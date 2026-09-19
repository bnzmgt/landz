<script setup>
import { PhXCircle, PhHouse, PhArrowsClockwise, PhClock } from "@phosphor-icons/vue";

const route = useRoute();
const invoiceNumber = computed(() => route.query.invoice || "");

const { data: statusData } = await useFetch(
    () => `/api/payment/status?invoice=${invoiceNumber.value}`,
    {
        immediate: Boolean(invoiceNumber.value),
    }
);

const transaction = computed(() => statusData.value?.transaction);
const isExpired = computed(() => transaction.value?.paymentStatus === "EXPIRED");

const formatCurrency = (val) => {
    return "Rp" + (val || 0).toLocaleString("id-ID");
};
</script>

<template>
    <div class="container mx-auto px-4 py-12 max-w-xl">
        <div class="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 text-center">
            <div
                class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"
                :class="isExpired ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'"
            >
                <PhClock v-if="isExpired" size="48" weight="fill" />
                <PhXCircle v-else size="48" weight="fill" />
            </div>

            <h1 class="text-2xl font-extrabold text-gray-900 mb-2">
                {{ isExpired ? 'Batas Waktu Pembayaran Habis' : 'Pembayaran Gagal / Dibatalkan' }}
            </h1>
            <p class="text-gray-500 text-sm mb-6">
                {{
                    isExpired
                        ? 'Batas waktu pembayaran (1 jam) untuk invoice ini telah kedaluwarsa. Silakan lakukan checkout ulang untuk membuat pesanan baru.'
                        : 'Mohon maaf, transaksi pembayaran Anda tidak berhasil diproses atau telah dibatalkan.'
                }}
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
                    <span class="font-bold" :class="isExpired ? 'text-amber-600' : 'text-red-500'">{{ formatCurrency(transaction.amount) }}</span>
                </div>

                <div class="flex justify-between">
                    <span class="text-gray-500">Status</span>
                    <span
                        class="badge text-white font-semibold"
                        :class="isExpired ? 'badge-warning' : 'badge-error'"
                    >
                        {{ isExpired ? 'EXPIRED (KADALUARSA)' : 'GAGAL / DIBATALKAN' }}
                    </span>
                </div>
            </div>

            <div class="space-y-3">
                <NuxtLink
                    :to="`/checkout/${transaction?.productId || 'baju-batik-wanita-modern-single-price-test'}`"
                    class="btn bg-primary hover:bg-primary-hover text-white w-full font-bold flex items-center justify-center gap-2"
                >
                    <PhArrowsClockwise size="20" />
                    Buat Pesanan Baru (Checkout Ulang)
                </NuxtLink>

                <NuxtLink to="/" class="btn btn-ghost w-full text-gray-500 flex items-center justify-center gap-2">
                    <PhHouse size="18" />
                    Kembali ke Beranda
                </NuxtLink>
            </div>
        </div>
    </div>
</template>
