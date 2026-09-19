<script setup>
import { PhCheckCircle, PhReceipt, PhHouse, PhArrowRight } from "@phosphor-icons/vue";

const route = useRoute();
const invoiceNumber = computed(() => route.query.invoice || route.query.order_id || "");

const { data: statusData, refresh, pending } = await useFetch(
    () => `/api/payment/status?invoice=${invoiceNumber.value}`,
    {
        immediate: Boolean(invoiceNumber.value),
    }
);

const transaction = computed(() => statusData.value?.transaction);

// Guard: If payment is not SUCCESS, redirect to the real status page (SSR & Client safe)
if (transaction.value) {
    if (transaction.value.paymentStatus === "PENDING") {
        await navigateTo(`/payment/pending?invoice=${invoiceNumber.value}`, { replace: true });
    } else if (transaction.value.paymentStatus === "FAILED" || transaction.value.paymentStatus === "EXPIRED") {
        await navigateTo(`/payment/failed?invoice=${invoiceNumber.value}`, { replace: true });
    }
}

watchEffect(() => {
    if (transaction.value) {
        if (transaction.value.paymentStatus === "PENDING") {
            navigateTo(`/payment/pending?invoice=${invoiceNumber.value}`, { replace: true });
        } else if (transaction.value.paymentStatus === "FAILED" || transaction.value.paymentStatus === "EXPIRED") {
            navigateTo(`/payment/failed?invoice=${invoiceNumber.value}`, { replace: true });
        }
    }
});

const formatCurrency = (val) => {
    return "Rp" + (val || 0).toLocaleString("id-ID");
};

const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
    });
};
</script>

<template>
    <div class="container mx-auto px-4 py-12 max-w-xl">
        <div class="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 text-center">
            <div class="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <PhCheckCircle size="48" weight="fill" />
            </div>

            <h1 class="text-2xl font-extrabold text-gray-900 mb-2">Pembayaran Berhasil!</h1>
            <p class="text-gray-500 text-sm mb-6">
                Terima kasih, transaksi Anda telah kami terima dan berhasil diverifikasi.
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

                <div v-if="transaction?.quantity" class="flex justify-between border-b border-gray-200 pb-2">
                    <span class="text-gray-500">Jumlah</span>
                    <span class="font-medium text-gray-800">{{ transaction.quantity }} item</span>
                </div>

                <div v-if="transaction?.amount" class="flex justify-between border-b border-gray-200 pb-2">
                    <span class="text-gray-500">Total Pembayaran</span>
                    <span class="font-bold text-primary">{{ formatCurrency(transaction.amount) }}</span>
                </div>

                <div v-if="transaction?.customerName" class="flex justify-between border-b border-gray-200 pb-2">
                    <span class="text-gray-500">Nama Pembeli</span>
                    <span class="font-medium text-gray-800">{{ transaction.customerName }}</span>
                </div>

                <div class="flex justify-between">
                    <span class="text-gray-500">Status</span>
                    <span class="badge badge-success text-white font-semibold">PAID / SUKSES</span>
                </div>
            </div>

            <div class="space-y-3">
                <NuxtLink
                    to="/"
                    class="btn bg-primary hover:bg-primary-hover text-white w-full font-bold flex items-center justify-center gap-2"
                >
                    <PhHouse size="20" />
                    Kembali ke Beranda
                </NuxtLink>
            </div>
        </div>
    </div>
</template>
