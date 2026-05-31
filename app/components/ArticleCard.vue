<script setup>
defineProps({
    article: Object,
});
</script>

<template>
    <article class="border rounded-xl overflow-hidden hover:shadow transition">
        <img v-if="article.image" :src="article.image" :alt="article.title" class="w-full h-44 object-cover" />

        <div class="p-4">
            <p class="text-xs text-gray-500 mb-1">by {{ article.author }} • {{ article.date }}</p>
            <NuxtLink :to="`/articles/${article.slug}`">
                <h2 class="font-semibold text-base line-clamp-2 hover:text-primary transition">
                    {{ article.title }}
                </h2>
            </NuxtLink>

            <p class="text-sm text-gray-500 mt-2 line-clamp-1">
                {{ article.description }}
            </p>
        </div>
    </article>
</template>
