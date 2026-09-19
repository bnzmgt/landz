<script setup>
import { PhArrowLeft, PhShieldCheck, PhLockKey, PhCreditCard } from "@phosphor-icons/vue";

const route = useRoute();
const router = useRouter();
const productSlug = route.params.product;

// Load product from Nuxt Content collection
const { data: product, status } = await useAsyncData(
    `checkout-product-${productSlug}`,
    () => queryCollection("products").path(`/products/${productSlug}`).first()
);

const customer = reactive({
    name: "",
    email: "",
    phone: "",
    quantity: 1,
});

const loading = ref(false);
const errorMessage = ref("");

const numericPrice = computed(() => {
    if (!product.value?.price) return 0;
    const clean = String(product.value.price).replace(/[^\d]/g, "");
    return parseInt(clean, 10) || 0;
});

const totalPrice = computed(() => {
    return numericPrice.value * customer.quantity;
});

const formattedTotal = computed(() => {
    return "Rp" + totalPrice.value.toLocaleString("id-ID");
});

const formattedUnitPrice = computed(() => {
    return "Rp" + numericPrice.value.toLocaleString("id-ID");
});

const formatCurrency = (val) => {
    return "Rp" + (val || 0).toLocaleString("id-ID");
};

const handleCheckout = async () => {
    if (!customer.name) {
        errorMessage.value = "Mohon isi nama lengkap Anda.";
        return;
    }
    if (!customer.phone) {
        errorMessage.value = "Mohon isi nomor telepon / WhatsApp.";
        return;
    }

    loading.value = true;
    errorMessage.value = "";

    try {
        const response = await $fetch("/api/payment/create", {
            method: "POST",
            body: {
                productId: productSlug,
                productName: product.value?.title || "Produk Pembelian",
                productPrice: numericPrice.value,
                productImage: product.value?.image || (product.value?.meta?.images?.[0] || ""),
                customerName: customer.name,
                customerEmail: customer.email,
                customerPhone: customer.phone,
                quantity: customer.quantity,
            },
        });

        console.log("[Checkout Response]:", response);

        if (response?.success && response?.paymentUrl) {
            console.log("Redirecting to payment URL:", response.paymentUrl);
            window.location.assign(response.paymentUrl);
        } else {
            errorMessage.value = response?.error || "Gagal membuat sesi pembayaran.";
        }
    } catch (err) {
        console.error("[Checkout Error]:", err);
        errorMessage.value = err?.data?.statusMessage || err?.data?.message || err?.message || "Terjadi kesalahan sistem saat memproses pembayaran.";
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="container mx-auto px-4 py-8 max-w-4xl">
        <!-- Back Navigation -->
        <div class="mb-6">
            <button
                @click="router.back()"
                class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition font-medium"
            >
                <PhArrowLeft size="18" />
                Kembali ke Produk
            </button>
        </div>

        <h1 class="text-2xl md:text-3xl font-bold mb-6 text-gray-900">Checkout Pesanan</h1>

        <div v-if="product" class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <!-- Left Column: Customer Details -->
            <div class="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <PhShieldCheck size="22" class="text-primary" />
                    Informasi Pembeli
                </h2>

                <div v-if="errorMessage" class="alert alert-error mb-4 text-sm text-white">
                    <span>{{ errorMessage }}</span>
                </div>

                <form @submit.prevent="handleCheckout" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Nama Lengkap <span class="text-red-500">*</span>
                        </label>
                        <input
                            v-model="customer.name"
                            type="text"
                            placeholder="Contoh: Budi Santoso"
                            required
                            class="input input-bordered w-full focus:input-primary"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            No. WhatsApp / Telepon <span class="text-red-500">*</span>
                        </label>
                        <input
                            v-model="customer.phone"
                            type="tel"
                            placeholder="Contoh: 08123456789"
                            required
                            class="input input-bordered w-full focus:input-primary"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Email (Opsional untuk Bukti Transaksi)
                        </label>
                        <input
                            v-model="customer.email"
                            type="email"
                            placeholder="budi@example.com"
                            class="input input-bordered w-full focus:input-primary"
                        />
                    </div>

                    <div class="pt-4 border-t border-gray-100">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Jumlah Pembelian (Qty)</label>
                        <div class="flex items-center gap-3">
                            <button
                                type="button"
                                class="btn btn-sm btn-outline btn-square"
                                :disabled="customer.quantity <= 1"
                                @click="customer.quantity--"
                            >
                                -
                            </button>
                            <span class="font-semibold text-lg w-8 text-center">{{ customer.quantity }}</span>
                            <button
                                type="button"
                                class="btn btn-sm btn-outline btn-square"
                                @click="customer.quantity++"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div class="pt-4">
                        <button
                            type="submit"
                            :disabled="loading"
                            class="btn bg-primary hover:bg-primary-hover text-white w-full btn-lg font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition"
                        >
                            <PhCreditCard size="22" />
                            <span v-if="!loading">Bayar Sekarang via DOKU</span>
                            <span v-else class="loading loading-spinner loading-sm"></span>
                        </button>
                        <p class="text-xs text-center text-gray-400 mt-2 flex items-center justify-center gap-1">
                            <PhLockKey size="14" />
                            Transaksi aman dienkripsi oleh DOKU Payment Gateway
                        </p>
                    </div>
                </form>
            </div>

            <!-- Right Column: Order Summary -->
            <div class="lg:col-span-5">
                <div class="bg-gray-50 rounded-2xl border border-gray-200 p-6 sticky top-6">
                    <h2 class="text-lg font-bold text-gray-800 mb-4">Ringkasan Pesanan</h2>

                    <div class="flex gap-4 pb-4 border-b border-gray-200">
                        <img
                            :src="product.image || product.meta?.images?.[0] || '/default.jpg'"
                            :alt="product.title"
                            class="w-20 h-20 object-cover rounded-xl border border-gray-200 bg-white"
                        />
                        <div class="flex-1 min-w-0">
                            <h3 class="font-semibold text-gray-900 text-sm line-clamp-2">{{ product.title }}</h3>
                            <p class="text-xs text-gray-500 mt-1 capitalize">{{ product.category }}</p>
                            <p class="text-sm font-bold text-primary mt-1">{{ formattedUnitPrice }}</p>
                        </div>
                    </div>

                    <div class="py-4 space-y-2 border-b border-gray-200 text-sm text-gray-600">
                        <div class="flex justify-between">
                            <span>Harga Satuan</span>
                            <span>{{ formattedUnitPrice }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Jumlah</span>
                            <span>x {{ customer.quantity }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Biaya Layanan</span>
                            <span class="text-green-600 font-medium">Gratis</span>
                        </div>
                    </div>

                    <div class="pt-4 flex justify-between items-center text-gray-900 font-bold">
                        <span>Total Pembayaran</span>
                        <span class="text-xl text-primary">{{ formattedTotal }}</span>
                    </div>

                    <div class="mt-6 p-3 bg-orange-50 rounded-xl border border-orange-100 text-xs text-orange-800 space-y-1">
                        <p class="font-semibold">Metode Pembayaran Tersedia di DOKU:</p>
                        <p>QRIS (GoPay, OVO, Dana, ShopeePay), Virtual Account (BCA, Mandiri, BRI, BNI), Kartu Kredit.</p>
                    </div>
                </div>
            </div>
        </div>

        <div v-else-if="status === 'pending'" class="text-center py-20">
            <span class="loading loading-spinner loading-lg text-primary"></span>
            <p class="text-gray-500 mt-2">Memuat detail produk...</p>
        </div>

        <div v-else class="text-center py-20">
            <h2 class="text-xl font-bold text-gray-800">Produk Tidak Ditemukan</h2>
            <p class="text-gray-500 mt-2">Produk yang Anda cari tidak tersedia untuk checkout.</p>
            <NuxtLink to="/" class="btn btn-primary mt-4">Kembali ke Beranda</NuxtLink>
        </div>
    </div>
</template>
