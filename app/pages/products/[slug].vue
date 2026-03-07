<template>
    <div v-if="product">
        <h1 class="text-3xl font-bold mb-4">
            {{ product.title }}
        </h1>

        <img :src="product.image" :alt="product.title" class="max-w-md mb-6" />

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
