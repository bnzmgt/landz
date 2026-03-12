<script setup>
defineProps({
    title: String,
    slug: String,
    image: String,
    count: Number,
});
</script>

<template>
    <NuxtLink :to="`/categories/${slug}`" class="block group">
        <div class="bg-base-100 rounded-xl overflow-hidden border hover:shadow-xl transition">
            <div class="bg-base-200 p-8 flex justify-center items-center">
                <img :src="image" :alt="title" class="w-full h-64 object-cover group-hover:scale-105 transition" />
            </div>

            <div class="p-4 text-center">
                <h3 class="font-semibold">
                    {{ title }}
                </h3>

                <p class="text-sm text-gray-400 mt-1">{{ count }} products</p>
            </div>
        </div>
    </NuxtLink>
</template>
