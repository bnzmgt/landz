<template>
    <div v-if="product">
        <h1 class="text-3xl font-bold mb-4">
            {{ product.title }}
        </h1>

        <!-- MAIN IMAGE -->
        <img v-if="mainImage" :src="mainImage" :alt="product.title" class="max-w-md mb-4 rounded-lg" />

        <!-- THUMBNAIL GALLERY -->
        <div v-if="galleryImages.length" class="flex flex-wrap gap-2 mb-6">
            <img v-for="img in galleryImages" :key="img" :src="img" :alt="product.title" class="w-20 h-20 object-cover border cursor-pointer" @click="mainImage = img" />
        </div>

        <p class="mb-6">
            {{ product.price }}
        </p>

        <CTAButton :url="product.affiliate" text="Buy on Shopee" />

        <div class="prose mt-10">
            <ContentRenderer :value="product" />
        </div>
    </div>

    <div v-else>Product not found</div>
</template>

<script setup>
const route = useRoute();

const { data: product } = await useAsyncData(`product-${route.params.slug}`, () => queryCollection("products").path(`/products/${route.params.slug}`).first());

/* ---------- IMAGE STATE ---------- */

const mainImage = ref(null);

/* normalize gallery images */
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

/* ---------- SEO ---------- */

useSeoMeta({
    title: () => product.value?.title,
    description: () => `Harga dan review ${product.value?.title}`,
    ogTitle: () => product.value?.title,
    ogDescription: () => `Harga dan review ${product.value?.title}`,
    ogImage: () => product.value?.image,
});

useHead({
    script: [
        {
            type: "application/ld+json",
            children: () =>
                JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Product",
                    name: product.value?.title,
                    image: product.value?.image,
                    offers: {
                        "@type": "Offer",
                        price: product.value?.price,
                        priceCurrency: "IDR",
                    },
                }),
        },
    ],
});
</script>
