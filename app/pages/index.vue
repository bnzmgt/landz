<script setup>
const year = new Date().getFullYear();
useSeo({
    title: `Rekomendasi Produk Terbaik ${year} | Murah & Berkualitas`,
    description: `Temukan rekomendasi produk Shopee terbaik ${year} dengan rating tinggi, harga murah, dan review terpercaya.`,
    image: "https://dotuquonline.com/og-cover.jpg",
    path: "/",
});

const { data: categories } = await useAsyncData("categories", () => queryCollection("categories").all());

const { data: products } = await useAsyncData("products", async () => {
    const res = await queryCollection("products").all();

    return res.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 8);
});

const { data: reviews } = await useAsyncData("reviews", () => queryCollection("reviews").limit(3).all());

const { getFeaturedArticles } = useArticles();
</script>

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
            <!-- WRAPPER -->
            <div class="flex flex-col md:flex-row gap-10">
                <!-- LEFT (40%) -->
                <div class="md:w-[30%] space-y-6">
                    <h2 class="text-xl font-semibold uppercase tracking-widest">Featured Products</h2>

                    <p class="text-sm text-gray-500 leading-relaxed">
                        Temukan produk pilihan terbaik yang sudah kami kurasi khusus untuk kamu. Update setiap hari dengan harga terbaik dari marketplace terpercaya.
                    </p>

                    <a href="https://shopee.co.id" target="_blank" class="inline-block bg-black text-white text-xs font-bold px-6 py-3 uppercase tracking-widest hover:bg-gray-800 transition">
                        Explore All Products
                    </a>
                </div>

                <!-- RIGHT (60%) -->
                <div class="md:w-[70%] grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ProductCardList
                        v-for="product in products"
                        :key="product.slug"
                        :title="product.title"
                        :image="product.image"
                        :price="product.price"
                        :slug="product.slug"
                        :affiliate="product.affiliate"
                        :category="product.category" />
                </div>
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
