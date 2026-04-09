<script setup>
const route = useRoute();
const slug = route.params.slug;

const { data: category } = await useAsyncData(`category-${slug}`, () => queryCollection("categories").where("slug", "=", slug).first());

const { data: products } = await useAsyncData(`category-products-${slug}`, () => queryCollection("products").where("category", "=", slug).all());

if (category.value) {
    const title = `${category.value.title} Terbaik 2026 | Harga Murah & Berkualitas`;

    const description = category.value.description || `Temukan ${category.value.title} terbaik dengan harga murah, kualitas bagus, dan rating tinggi. Update terbaru 2026.`;

    useSeo({
        title,
        description,
        image: category.value.image,
        path: `/categories/${category.value.slug}`,
    });
}
</script>

<template>
    <div class="container mx-auto">
        <nav class="text-sm text-gray-400 mb-6 flex items-center gap-2">
            <NuxtLink to="/" class="hover:text-gray-900 transition">Home</NuxtLink>

            <span>/</span>

            <NuxtLink to="/categories" class="hover:text-gray-900 transition">Categories</NuxtLink>

            <span>/</span>

            <span class="text-gray-600">
                {{ category?.title || slug }}
            </span>
        </nav>
        <h1 class="text-3xl font-bold mb-8">Category: {{ category?.title || slug }}</h1>

        <div v-if="products?.length" class="grid md:grid-cols-3 gap-6">
            <ProductCard v-for="product in products" :key="product.slug" :title="product.title" :image="product.image" :price="product.price" :slug="product.slug" :affiliate="product.affiliate" />
        </div>

        <div v-else>No products found</div>
    </div>
</template>
