<script setup>
const { data: categories } = await useAsyncData("categories", async () => {
    const products = await queryCollection("products").all();

    const map = {};

    products.forEach(p => {
        if (!p.category) return;

        if (!map[p.category]) {
            map[p.category] = {
                slug: p.category,
                title: p.category.replace("-", " "),
                image: p.image,
                count: 0,
            };
        }

        map[p.category].count++;
    });

    return Object.values(map);
});
</script>

<template>
    <div class="container mx-auto">
        <nav class="text-sm text-gray-400 mb-6 flex items-center gap-2">
            <NuxtLink to="/" class="hover:text-gray-900 transition">Home</NuxtLink>

            <span>/</span>

            <span class="text-gray-600">Categories</span>
        </nav>
        <h1 class="text-2xl font-bold mb-10">Categories</h1>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
            <CategoryCard v-for="cat in categories" :key="cat.slug" v-bind="cat" />
        </div>
    </div>
</template>
