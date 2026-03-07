<template>
    <NuxtLink :to="`/categories/${slug}`">
        <div class="card bg-base-100 shadow hover:shadow-lg transition">
            <figure class="p-6">
                <img :src="image" :alt="title" class="h-28 object-contain" />
            </figure>

            <div class="card-body items-center text-center">
                <h2 class="card-title text-base">
                    {{ title }}
                </h2>

                <p class="text-sm opacity-70">{{ count }} products</p>
            </div>
        </div>
    </NuxtLink>
</template>

<script setup>
defineProps({
    title: String,
    slug: String,
    image: String,
    count: Number,
});
</script>
