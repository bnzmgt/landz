<script setup>
import {
    PhFlask,
    PhShoppingCart,
    PhArrowRight,
    PhCheckCircle,
    PhClock,
    PhXCircle,
    PhCreditCard,
    PhTerminalWindow,
    PhShieldCheck
} from "@phosphor-icons/vue";

useHead({
    title: "DOKU Payment Integration Tester (Sandbox)",
    meta: [{ name: "robots", content: "noindex, nofollow" }],
});

const testProduct = reactive({
    id: "test-doku-product",
    title: "Item Uji Coba DOKU Sandbox - Baju Batik Test",
    price: 15000,
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop&q=60",
    category: "test-category",
});

const form = reactive({
    name: "Tester DOKU",
    email: "tester@doku-sandbox.com",
    phone: "081298765432",
    quantity: 1,
});

const loading = ref(false);
const latestResult = ref(null);
const logs = ref([]);

const addLog = (msg, type = "info") => {
    logs.value.unshift({
        time: new Date().toLocaleTimeString(),
        message: msg,
        type,
    });
};

const handleCreatePayment = async () => {
    loading.value = true;
    addLog(`Initiating payment creation for ${testProduct.title}...`, "info");

    try {
        const response = await $fetch("/api/payment/create", {
            method: "POST",
            body: {
                productId: testProduct.id,
                productName: testProduct.title,
                productPrice: testProduct.price,
                productImage: testProduct.image,
                customerName: form.name,
                customerEmail: form.email,
                customerPhone: form.phone,
                quantity: form.quantity,
            },
        });

        latestResult.value = response;
        addLog(`Payment created successfully! Invoice: ${response.invoiceNumber}`, "success");
        if (response.isMock) {
            addLog(`Running in Mock/Sandbox Mode (No actual credentials configured).`, "warning");
        }
    } catch (err) {
        addLog(`Payment initiation error: ${err?.data?.statusMessage || err?.message}`, "error");
    } finally {
        loading.value = false;
    }
};

const simulateWebhook = async (status = "SUCCESS") => {
    if (!latestResult.value?.invoiceNumber) {
        addLog("No invoice to simulate webhook for! Create a payment first.", "error");
        return;
    }

    addLog(`Simulating webhook notification for ${latestResult.value.invoiceNumber} with status ${status}...`, "info");

    try {
        const response = await $fetch("/api/payment/callback", {
            method: "POST",
            body: {
                order: {
                    invoice_number: latestResult.value.invoiceNumber,
                    amount: latestResult.value.amount,
                },
                transaction: {
                    status,
                    date: new Date().toISOString(),
                },
                channel: {
                    id: "QRIS",
                },
            },
        });

        addLog(`Webhook acknowledged: ${JSON.stringify(response)}`, "success");
    } catch (err) {
        addLog(`Webhook simulation failed: ${err?.data?.statusMessage || err?.message}`, "error");
    }
};

const formatCurrency = (val) => {
    return "Rp" + (val || 0).toLocaleString("id-ID");
};
</script>

<template>
    <div class="container mx-auto px-4 py-8 max-w-5xl">
        <!-- Header banner -->
        <div class="bg-gradient-to-r from-neutral to-gray-800 text-white p-6 rounded-3xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
            <div>
                <div class="flex items-center gap-2 text-warning mb-1 font-semibold text-sm">
                    <PhFlask size="20" />
                    <span>SANDBOX / TEST ENVIRONMENT</span>
                </div>
                <h1 class="text-2xl md:text-3xl font-bold">DOKU Payment Integration Tester</h1>
                <p class="text-gray-300 text-sm mt-1">Halaman uji coba flow end-to-end tanpa merusak data katalog produksi.</p>
            </div>
            <div class="badge badge-warning font-semibold text-xs py-3 px-4">
                NOINDEX / PRIVATE
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <!-- Left: Test Controls & Product -->
            <div class="lg:col-span-7 space-y-6">
                <!-- Test Product Card -->
                <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h2 class="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                        <PhShoppingCart size="20" class="text-primary" />
                        1. Produk Uji Coba
                    </h2>

                    <div class="flex gap-4 items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <img :src="testProduct.image" class="w-16 h-16 object-cover rounded-lg" />
                        <div class="flex-1">
                            <h3 class="font-semibold text-sm text-gray-900">{{ testProduct.title }}</h3>
                            <p class="text-primary font-bold text-base mt-1">{{ formatCurrency(testProduct.price) }}</p>
                        </div>
                    </div>

                    <!-- Test Form -->
                    <div class="mt-4 space-y-3">
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="text-xs font-medium text-gray-600 block mb-1">Nama Pelanggan</label>
                                <input v-model="form.name" type="text" class="input input-bordered input-sm w-full" />
                            </div>
                            <div>
                                <label class="text-xs font-medium text-gray-600 block mb-1">WhatsApp / Phone</label>
                                <input v-model="form.phone" type="text" class="input input-bordered input-sm w-full" />
                            </div>
                        </div>
                        <div>
                            <label class="text-xs font-medium text-gray-600 block mb-1">Email</label>
                            <input v-model="form.email" type="email" class="input input-bordered input-sm w-full" />
                        </div>
                    </div>

                    <div class="mt-5">
                        <button
                            @click="handleCreatePayment"
                            :disabled="loading"
                            class="btn bg-primary hover:bg-primary-hover text-white w-full font-bold flex items-center justify-center gap-2"
                        >
                            <PhCreditCard size="20" />
                            <span v-if="!loading">Test Checkout API (/api/payment/create)</span>
                            <span v-else class="loading loading-spinner loading-sm"></span>
                        </button>
                    </div>
                </div>

                <!-- Webhook / Callback Simulator -->
                <div v-if="latestResult" class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h2 class="font-bold text-gray-800 text-lg mb-2 flex items-center gap-2">
                        <PhShieldCheck size="20" class="text-green-600" />
                        2. Simulasi Webhook DOKU (/api/payment/callback)
                    </h2>
                    <p class="text-xs text-gray-500 mb-4">
                        Invoice aktif: <span class="font-mono font-bold text-gray-800">{{ latestResult.invoiceNumber }}</span>
                    </p>

                    <div class="grid grid-cols-2 gap-3">
                        <button
                            @click="simulateWebhook('SUCCESS')"
                            class="btn bg-emerald-600 hover:bg-emerald-700 text-white btn-sm font-semibold flex items-center justify-center gap-1 border-none shadow-sm"
                        >
                            <PhCheckCircle size="16" /> Kirim Callback SUCCESS
                        </button>
                        <button
                            @click="simulateWebhook('FAILED')"
                            class="btn bg-rose-600 hover:bg-rose-700 text-white btn-sm font-semibold flex items-center justify-center gap-1 border-none shadow-sm"
                        >
                            <PhXCircle size="16" /> Kirim Callback FAILED
                        </button>
                    </div>

                    <div class="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                        <a
                            :href="latestResult.paymentUrl"
                            target="_blank"
                            class="btn btn-outline btn-primary btn-sm flex-1"
                        >
                            Buka URL Pembayaran
                            <PhArrowRight size="16" />
                        </a>
                        <NuxtLink
                            :to="`/payment/success?invoice=${latestResult.invoiceNumber}`"
                            class="btn btn-outline btn-sm"
                        >
                            Lihat Halaman Sukses
                        </NuxtLink>
                    </div>
                </div>
            </div>

            <!-- Right: Activity Logs & Checklist -->
            <div class="lg:col-span-5 space-y-6">
                <!-- Checklist -->
                <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h2 class="font-bold text-gray-800 text-lg mb-4">Checklist Pengujian Flow</h2>
                    <ul class="space-y-2 text-sm">
                        <li class="flex items-center gap-2">
                            <PhCheckCircle size="18" class="text-green-600" />
                            <span>Produk ditampilkan dengan benar</span>
                        </li>
                        <li class="flex items-center gap-2">
                            <PhCheckCircle size="18" :class="latestResult ? 'text-green-600' : 'text-gray-300'" />
                            <span>Payload checkout berhasil dikirim</span>
                        </li>
                        <li class="flex items-center gap-2">
                            <PhCheckCircle size="18" :class="latestResult ? 'text-green-600' : 'text-gray-300'" />
                            <span>Invoice DOKU ter-generate</span>
                        </li>
                        <li class="flex items-center gap-2">
                            <PhCheckCircle size="18" :class="latestResult?.paymentUrl ? 'text-green-600' : 'text-gray-300'" />
                            <span>Payment URL / Gateway tersedia</span>
                        </li>
                        <li class="flex items-center gap-2">
                            <PhCheckCircle size="18" class="text-green-600" />
                            <span>Webhook & Update Status didukung</span>
                        </li>
                    </ul>
                </div>

                <!-- Realtime Log Console -->
                <div class="bg-gray-900 text-gray-100 rounded-2xl p-4 shadow-sm">
                    <div class="flex items-center justify-between pb-2 mb-2 border-b border-gray-800 text-xs text-gray-400">
                        <span class="flex items-center gap-1 font-mono">
                            <PhTerminalWindow size="16" /> Live Execution Logs
                        </span>
                        <button @click="logs = []" class="hover:text-white">Clear</button>
                    </div>
                    <div class="h-48 overflow-y-auto font-mono text-xs space-y-1.5 scrollbar-thin">
                        <div v-if="!logs.length" class="text-gray-500 italic">Belum ada aksi yang dijalankan...</div>
                        <div
                            v-for="(log, idx) in logs"
                            :key="idx"
                            :class="{
                                'text-green-400': log.type === 'success',
                                'text-red-400': log.type === 'error',
                                'text-amber-400': log.type === 'warning',
                                'text-gray-300': log.type === 'info',
                            }"
                        >
                            <span class="text-gray-500">[{{ log.time }}]</span> {{ log.message }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
