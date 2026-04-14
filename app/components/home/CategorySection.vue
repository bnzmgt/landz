<script setup>
defineProps({
  title: String,
  products: Array,
  articles: Array
})
</script>

<template>
  <section class="mb-12">
    <h2 class="text-2xl font-bold mb-6">
      {{ title }}
    </h2>

    <!-- PRODUCTS -->
    <div v-if="products?.length" class="mb-6">
      <h3 class="text-lg font-semibold mb-3">Produk</h3>

      <div class="grid md:grid-cols-4 gap-4">
        <ProductCard
          v-for="product in products"
          :key="product.slug"
          :product="product"
        />
      </div>
    </div>

    <!-- ARTICLES -->
    <div v-if="articles?.length">
      <h3 class="text-lg font-semibold mb-3">Artikel</h3>

      <div class="grid md:grid-cols-3 gap-4">
        <ArticleCard
          v-for="article in articles"
          :key="article.slug"
          :article="article"
        />
      </div>
    </div>
  </section>
</template>