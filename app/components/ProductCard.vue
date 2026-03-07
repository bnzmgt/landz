<template>
    <div class="card bg-base-100 shadow hover:shadow-lg transition">
        <figure class="p-6">
            <img :src="image" :alt="title" class="h-40 object-contain" />
        </figure>

        <div class="card-body">
            <h2 class="card-title text-base">
                {{ title }}
            </h2>

            <p class="text-sm opacity-70">
                {{ price }}
            </p>

            <div class="card-actions mt-4">
                <NuxtLink :to="`/products/${slug}`" class="btn btn-outline btn-sm">Detail</NuxtLink>

                <a :href="affiliate" target="_blank" class="btn btn-primary btn-sm">Shopee</a>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    title: String,
    image: String,
    price: String,
    slug: String,
    affiliate: String,
});
</script>
