<script setup>
const route = useRoute()

const { data: article } = await useAsyncData("article", () =>
  queryCollection("articles")
    .where("slug", "=", route.params.slug)
    .first()
)

useSeoMeta({
  title: article.value?.title,
  description: article.value?.description,

  ogTitle: article.value?.title,
  ogDescription: article.value?.description,
  ogImage: article.value?.image,

  twitterCard: "summary_large_image"
})

useHead({
  link: [
    {
      rel: "canonical",
      href: `https://dotuquonline.com/articles/${route.params.slug}`
    }
  ]
})
</script>

<template>
  <div class="max-w-3xl mx-auto p-6" v-if="article">
    <img
      v-if="article.image"
      :src="article.image"
      :alt="article.title"
      class="w-full h-64 object-cover rounded-xl mb-6"
    />

    <h1 class="text-3xl font-bold mb-2">
      {{ article.title }}
    </h1>

    <p class="text-sm text-gray-500 mb-6">
      {{ article.date }} • {{ article.author }}
    </p>

    <div class="prose max-w-none">
      <ContentRenderer :value="article" />
    </div>
  </div>

  <div v-else class="p-6 text-center">
    Article not found
  </div>
</template>