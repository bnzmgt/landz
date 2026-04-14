<script setup>
defineProps({
  article: Object,
});
</script>

<template>
  <article class="border rounded-xl overflow-hidden hover:shadow transition">
    <!-- IMAGE FULL -->
    <img
      v-if="article.image"
      :src="article.image"
      :alt="article.title"
      class="w-full h-44 object-cover"
    />

    <!-- CONTENT -->
    <div class="p-4">
      <!-- TITLE (CLICKABLE) -->
      <NuxtLink :to="`/articles/${article.slug}`">
        <h2
          class="font-semibold text-lg line-clamp-2 hover:text-primary transition"
        >
          {{ article.title }}
        </h2>
      </NuxtLink>

      <!-- DESCRIPTION -->
      <p class="text-sm text-gray-500 mt-2 line-clamp-2">
        {{ article.description }}
      </p>
    </div>
  </article>
</template>
