<template>
    <div>
        <h1 class="text-3xl font-bold mb-8">Category: {{ slug }}</h1>

        <div v-if="products?.length" class="grid md:grid-cols-3 gap-6">
            <ProductCard v-for="product in products" :key="product.slug" :title="product.title" :image="product.image" :price="product.price" :slug="product.slug" :affiliate="product.affiliate" />
        </div>

        <div v-else>No products found</div>
    </div>
</template>

<script setup>
const route = useRoute();
const slug = route.params.slug;

const { data: products } = await useAsyncData(`category-${slug}`, () => queryCollection("products").where("category", "=", slug).all());
</script>
