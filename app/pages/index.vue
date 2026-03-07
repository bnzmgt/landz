<template>
    <div>
        <h1 class="text-3xl font-bold mb-8">Featured Products</h1>
        <CTAButton url="https://shopee.co.id" text="Visit Shopee" />
        <div class="grid md:grid-cols-3 gap-6">
            <ProductCard v-for="product in products" :key="product.slug" :title="product.title" :image="product.image" :price="product.price" :slug="product.slug" :affiliate="product.affiliate" />
        </div>
    </div>
    <section>
        <h2 class="text-3xl font-bold mb-8">Categories</h2>

        <div class="grid md:grid-cols-3 gap-6">
            <CategoryCard v-for="cat in categories" :key="cat.slug" :title="cat.title" :slug="cat.slug" :image="cat.image" :count="cat.count || 0" />
        </div>
    </section>
    <section class="mt-16">
        <h2 class="text-3xl font-bold mb-8">Latest Reviews</h2>

        <div class="grid md:grid-cols-3 gap-6">
            <NuxtLink v-for="review in reviews" :key="review.path" :to="review.path" class="card bg-base-100 shadow hover:shadow-lg transition p-6">
                <h3 class="text-lg font-semibold">
                    {{ review.title }}
                </h3>

                <p class="text-sm opacity-70 mt-2">
                    {{ review.description }}
                </p>
            </NuxtLink>
        </div>
    </section>
</template>

<script setup>
const { data: categories } = await useAsyncData("categories", () => queryCollection("categories").all());
const { data: products } = await useAsyncData("products", () => queryCollection("products").limit(6).all());
const { data: reviews } = await useAsyncData("reviews", () => queryCollection("reviews").limit(3).all());
</script>
