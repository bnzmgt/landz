<script setup>
import { PhClock, PhArrowsClockwise, PhCheck, PhX, PhShieldCheck } from "@phosphor-icons/vue";

const route = useRoute();
const router = useRouter();
const invoiceNumber = computed(() => route.query.invoice || "");
const isMock = computed(() => route.query.mock === "true");

const { data: statusData, refresh, pending } = await useFetch(
    () => `/api/payment/status?invoice=${invoiceNumber.value}`,
    {
        immediate: Boolean(invoiceNumber.value),
    }
);

const transaction = computed(() => statusData.value?.transaction);
const simulating = ref(false);

// Auto redirect to success if payment is already confirmed
if (transaction.value) {
    if (transaction.value.paymentStatus === "SUCCESS") {
        await navigateTo(`/payment/success?invoice=${invoiceNumber.value}`, { replace: true });
    } else if (transaction.value.paymentStatus === "FAILED" || transaction.value.paymentStatus === "EXPIRED") {
        await navigateTo(`/payment/failed?invoice=${invoiceNumber.value}`, { replace: true });
    }
}

watchEffect(() => {
    if (transaction.value?.paymentStatus === "SUCCESS") {
        navigateTo(`/payment/success?invoice=${invoiceNumber.value}`, { replace: true });
    } else if (transaction.value?.paymentStatus === "FAILED" || transaction.value?.paymentStatus === "EXPIRED") {
        navigateTo(`/payment/failed?invoice=${invoiceNumber.value}`, { replace: true });
    }
});

const checkStatus = async () => {
    await refresh();
};

const simulatePayment = async (action) => {
    simulating.value = true;
    try {
        await $fetch(`/api/payment/status?invoice=${invoiceNumber.value}&action=${action}`);
        await checkStatus();
    } catch (err) {
        console.error("Simulation failed:", err);
    } finally {
        simulating.value = false;
    }
};

const formatCurrency = (val) => {
    return "Rp" + (val || 0).toLocaleString("id-ID");
};
</script>

<template>
    <div class="container mx-auto px-4 py-12 max-w-xl">
        <div class="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 text-center">
            <div class="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <PhClock size="48" weight="fill" />
            </div>

            <h1 class="text-2xl font-extrabold text-gray-900 mb-2">Menunggu Pembayaran</h1>
            <p class="text-gray-500 text-sm mb-6">
                Silakan selesaikan pembayaran Anda sesuai instruksi pada DOKU Payment Gateway.
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
                    <span class="font-bold text-primary">{{ formatCurrency(transaction.amount) }}</span>
                </div>

                <div class="flex justify-between">
                    <span class="text-gray-500">Status Saat Ini</span>
                    <span class="badge badge-warning text-white font-semibold">PENDING</span>
                </div>
            </div>

            <!-- Sandbox / Test Simulation Tools -->
            <div v-if="isMock || !transaction?.dokuReference?.startsWith('http')" class="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-left text-xs">
                <p class="font-bold text-amber-900 mb-1 flex items-center gap-1">
                    <PhShieldCheck size="16" /> Mode Sandbox / Mock Testing
                </p>
                <p class="text-amber-700 mb-3">
                    Gunakan tombol di bawah untuk menyimulasikan notifikasi pembayaran dari DOKU:
                </p>
                <div class="flex gap-2">
                    <button
                        @click="simulatePayment('simulate_success')"
                        :disabled="simulating"
                        class="btn bg-emerald-600 hover:bg-emerald-700 text-white btn-sm flex-1 font-semibold border-none shadow-sm"
                    >
                        <PhCheck size="16" /> Simulasi Sukses
                    </button>
                    <button
                        @click="simulatePayment('simulate_failed')"
                        :disabled="simulating"
                        class="btn bg-rose-600 hover:bg-rose-700 text-white btn-sm flex-1 font-semibold border-none shadow-sm"
                    >
                        <PhX size="16" /> Simulasi Gagal
                    </button>
                </div>
            </div>

            <div class="space-y-3">
                <button
                    @click="checkStatus"
                    :disabled="pending"
                    class="btn bg-primary hover:bg-primary-hover text-white w-full font-bold flex items-center justify-center gap-2"
                >
                    <PhArrowsClockwise size="20" :class="pending ? 'animate-spin' : ''" />
                    Cek Status Pembayaran
                </button>

                <NuxtLink to="/" class="btn btn-ghost w-full text-gray-500">
                    Kembali ke Beranda
                </NuxtLink>
            </div>
        </div>
    </div>
</template>
