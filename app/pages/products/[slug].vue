<script setup>
import { PhCaretCircleUp, PhCaretCircleDown } from "@phosphor-icons/vue";
const route = useRoute();

const { data: product } = await useAsyncData(`product-${route.params.slug}`, () => queryCollection("products").path(`/products/${route.params.slug}`).first());

if (product.value) {
    const image = product.value.meta?.images?.[0] || product.value.image || "/default.jpg";

    const description = product.value.description?.slice(0, 150) || `Dapatkan ${product.value.title} dengan harga terbaik dan kualitas terjamin.`;

    useSeo({
        title: `${product.value.title} | Beli Murah & Terpercaya`,
        description,
        image,
        path: `/products/${product.value.slug}`,
    });

    useHead({
        script: [
            {
                type: "application/ld+json",
                children: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Product",

                    name: product.value.title,
                    image: product.value.meta?.images?.length ? product.value.meta.images : [image],

                    description,

                    offers: {
                        "@type": "Offer",
                        priceCurrency: "IDR",
                        price: product.value.price?.replace(/[^\d]/g, "") || "0",
                        availability: "https://schema.org/InStock",
                        url: product.value.affiliate,
                    },
                }),
            },
        ],
    });
}

const mainImage = ref(null);
const galleryImages = computed(() => {
    if (!product.value) return [];

    if (product.value.meta?.images?.length) {
        return product.value.meta.images;
    }

    if (product.value.image) {
        return [product.value.image];
    }

    return [];
});

watchEffect(() => {
    if (!galleryImages.value.length) return;
    mainImage.value = galleryImages.value[0];
});

const thumbContainer = ref(null);
const scrollUp = () => {
    thumbContainer.value.scrollBy({ top: -120, behavior: "smooth" });
};
const scrollDown = () => {
    thumbContainer.value.scrollBy({ top: 120, behavior: "smooth" });
};

const expanded = ref(false);
</script>

<template>
    <div v-if="product" class="container mx-auto">
        <nav class="text-sm text-gray-400 mb-6 flex items-center gap-2">
            <NuxtLink to="/" class="hover:text-gray-900 transition">Home</NuxtLink>

            <span>/</span>

            <NuxtLink to="/categories" class="hover:text-gray-900 transition">Categories</NuxtLink>

            <span>/</span>

            <NuxtLink :to="`/categories/${product.category}`" class="hover:text-gray-900 transition">
                {{ product.category }}
            </NuxtLink>

            <span>/</span>

            <span class="text-gray-600 line-clamp-1">
                {{ product.title }}
            </span>
        </nav>
        <div class="grid lg:grid-cols-2 gap-12 items-start">
            <div class="flex gap-4">
                <div class="flex flex-col items-center gap-2">
                    <button v-if="galleryImages.length > 4" class="btn btn-circle btn-xs" @click="scrollUp"><PhCaretCircleUp /></button>

                    <div ref="thumbContainer" class="flex flex-col gap-3 max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                        <img v-for="img in galleryImages" :key="img" :src="img" class="w-20 h-20 object-cover border rounded cursor-pointer hover:border-primary" @click="mainImage = img" />
                    </div>

                    <button v-if="galleryImages.length > 4" class="btn btn-circle btn-xs" @click="scrollDown"><PhCaretCircleDown /></button>
                </div>

                <div class="flex-1 bg-base-200 rounded-xl flex items-center justify-center p-2">
                    <img v-if="mainImage" :src="mainImage" :alt="product.title" class="max-h-[420px] object-contain" />
                </div>
            </div>

            <div>
                <p class="text-sm text-gray-500 mb-2">
                    {{ product.category }}
                </p>

                <h1 class="text-3xl font-bold mb-4">
                    {{ product.title }}
                </h1>

                <div class="flex items-center gap-3 mb-4">
                    <span class="text-3xl font-bold text-red-500">
                        {{ product.price }}
                    </span>

                    <span v-if="product.oldPrice" class="line-through text-gray-400">
                        {{ product.oldPrice }}
                    </span>

                    <span v-if="product.discount" class="badge badge-warning">-{{ product.discount }}%</span>
                </div>

                <p class="text-green-600 mb-6">✔ {{ product.stock || "" }} In Stock, Ready to be shipped!</p>

                <a :href="product.affiliate" target="_blank" class="btn bg-primary hover:bg-primary-light text-white btn-lg w-full">Add to Cart</a>

                <div class="mt-8">
                    <div class="prose max-w-none transition-all" :class="expanded ? '' : 'line-clamp-4'">
                        <ContentRenderer :value="product" />
                    </div>

                    <button class="text-sm text-primary mt-2 font-medium" @click="expanded = !expanded">
                        {{ expanded ? "Read Less" : "Read More" }}
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div v-else class="text-center py-20">Product not found</div>
</template>
