<template>
    <div class="container mx-auto">
        <!-- HERO -->
        <div class="relative bg-gray-100 h-64 flex items-center justify-center overflow-hidden mb-20">
            <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200" class="absolute inset-0 w-full h-full object-cover opacity-60" />

            <div class="relative text-center space-y-4 px-4">
                <h3 class="text-xl font-bold uppercase tracking-widest text-white drop-shadow-md">Discover Trending Products</h3>

                <p class="text-white text-xs tracking-wide">Handpicked affiliate products from trusted marketplaces.</p>
            </div>
        </div>

        <section class="mb-20">
            <h2 class="text-xl font-semibold uppercase tracking-widest mb-10">Featured Products</h2>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
                <ProductCard
                    v-for="product in products"
                    :key="product.slug"
                    :title="product.title"
                    :image="product.image"
                    :price="product.price"
                    :slug="product.slug"
                    :affiliate="product.affiliate"
                    :category="product.category" />
            </div>
        </section>

        <section class="mb-20">
            <h2 class="text-xl font-semibold uppercase tracking-widest mb-10">Categories</h2>

            <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
                <CategoryCard v-for="cat in categories" :key="cat.slug" :title="cat.title" :slug="cat.slug" :image="cat.image" :count="cat.count || 0" />
            </div>
        </section>

        <section v-if="reviews?.length">
            <h2 class="text-xl font-semibold uppercase tracking-widest mb-10">Latest Reviews</h2>

            <div class="grid md:grid-cols-3 gap-6">
                <NuxtLink v-for="review in reviews" :key="review.path" :to="review.path" class="border border-gray-100 p-6 hover:shadow-lg transition">
                    <h3 class="text-lg font-semibold">
                        {{ review.title }}
                    </h3>

                    <p class="text-sm text-gray-500 mt-2">
                        {{ review.description }}
                    </p>
                </NuxtLink>
            </div>
        </section>
    </div>
</template>

<script setup>
const { data: categories } = await useAsyncData("categories", () => queryCollection("categories").all());

const { data: products } = await useAsyncData("products", () => queryCollection("products").limit(6).all());

const { data: reviews } = await useAsyncData("reviews", () => queryCollection("reviews").limit(3).all());

useSeoMeta({
    title: "Rekomendasi Produk Shopee Terbaik 2026",
    description: "Temukan rekomendasi produk Shopee terbaik dengan rating tinggi, harga murah, dan review terpercaya.",

    robots: "index, follow",

    ogTitle: "Rekomendasi Produk Shopee Terbaik",
    ogDescription: "Kumpulan produk terbaik dari Shopee dengan rating tinggi dan harga terbaik.",
    ogImage: "https://dotuquonline.com/og-cover.jpg",

    ogType: "website",

    twitterCard: "summary_large_image",
});

useHead({
    link: [
        {
            rel: "canonical",
            href: "https://dotuquonline.com",
        },
    ],
});
</script>
