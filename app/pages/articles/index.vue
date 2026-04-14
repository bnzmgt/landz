<script setup>
const { data: articles } = await useAsyncData("articles", () => queryCollection("articles").all());
</script>

<template>
  <div class="max-w-5xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">Articles</h1>

    <div class="grid md:grid-cols-3 gap-6">
      <ArticleCard
        v-for="article in articles"
        :key="article.slug"
        :article="article"
      />
    </div>
  </div>
</template>
