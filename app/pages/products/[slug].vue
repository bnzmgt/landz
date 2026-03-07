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
</script>
