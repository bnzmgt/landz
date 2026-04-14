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
    <div
      class="bg-primary rounded-xl overflow-hidden border hover:shadow-xl transition"
    >
      <div class="bg-primary flex justify-center items-center">
        <img
          :src="image"
          :alt="title"
          class="w-full h-40 object-cover group-hover:scale-105 transition"
        />
      </div>

      <div class="p-4 text-center">
        <h3 class="font-normal text-white">
          {{ title }}
        </h3>

        <p class="text-xs text-black mt-1">{{ count }} products</p>
      </div>
    </div>
  </NuxtLink>
</template>
