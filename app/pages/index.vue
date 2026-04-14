<script setup>
const year = new Date().getFullYear();
useSeo({
  title: `Rekomendasi Produk Terbaik ${year} | Murah & Berkualitas`,
  description: `Temukan rekomendasi produk Shopee terbaik ${year} dengan rating tinggi, harga murah, dan review terpercaya.`,
  image: "https://dotuquonline.com/og-cover.jpg",
  path: "/",
});

const { data: categories } = await useAsyncData("categories", () =>
  queryCollection("categories").all(),
);

const { data: products } = await useAsyncData("products", async () => {
  const res = await queryCollection("products").all();

  return (res || [])
    .filter((p) => p?.slug)
    .sort((a, b) => {
      const da = new Date(a.date || "1970-01-01").getTime();
      const db = new Date(b.date || "1970-01-01").getTime();
      return db - da;
    });
});

const { data: reviews } = await useAsyncData("reviews", () =>
  queryCollection("reviews").limit(3).all(),
);

const featuredProducts = computed(() => {
  if (!products.value) return [];
  return products.value.slice(0, 5);
});

const { data: featured } = await useAsyncData("featured-articles", () =>
  queryCollection("articles").where("isFeatured", "=", true).limit(3).all(),
);

const { data: braArticle } = await useAsyncData("bra-articles", () =>
  queryCollection("articles").where("category", "=", "bra").limit(3).all(),
);

const { data: fashionMuslimArticle } = await useAsyncData(
  "fashion-muslim-articles",
  () =>
    queryCollection("articles")
      .where("category", "=", "fashion-muslim")
      .limit(3)
      .all(),
);

const fashionMuslimProducts = computed(() => {
  if (!products.value) return [];
  return products.value
    .filter((p) => p.category === "fashion-muslim")
    .slice(0, 6);
});

const pakaianDalamProducts = computed(() => {
  if (!products.value) return [];
  return products.value
    .filter((p) => p.category === "pakaian-dalam")
    .slice(0, 6);
});
</script>

<template>
  <div class="container mx-auto">
    <!-- HERO -->
    <div
      class="relative bg-gray-100 h-64 flex items-center justify-center overflow-hidden mb-20"
    >
      <img
        src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200"
        class="absolute inset-0 w-full h-full object-cover opacity-60"
      />

      <div class="relative text-center space-y-4 px-4">
        <h3
          class="text-xl font-bold uppercase tracking-widest text-white drop-shadow-md"
        >
          Discover Trending Products
        </h3>

        <p class="text-white text-xs tracking-wide">
          Handpicked affiliate products from trusted marketplaces.
        </p>
      </div>
    </div>

    <section class="mb-20">
      <h2 class="text-xl font-semibold uppercase tracking-widest mb-10">
        Categories
      </h2>

      <div class="grid grid-cols-2 md:grid-cols-6 gap-2">
        <CategoryCard
          v-for="cat in categories"
          :key="cat.slug"
          :title="cat.title"
          :slug="cat.slug"
          :image="cat.image"
          :count="cat.count || 0"
        />
      </div>
    </section>

    <section class="mb-20">
      <h2 class="text-xl font-semibold uppercase tracking-widest mb-10">
        Featured Products
      </h2>

      <div class="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-12">
        <ProductCard
          v-for="product in featuredProducts || []"
          :key="product.slug"
          :title="product.title"
          :image="product.image"
          :price="product.price"
          :slug="product.slug"
          :affiliate="product.affiliate"
          :category="product.category"
        />
      </div>
    </section>

    <section class="mb-20">
      <!-- WRAPPER -->
      <h2 class="text-xl font-semibold uppercase tracking-widest">
        Muslim Wear Essentials
      </h2>
      <div class="flex flex-col md:flex-row gap-10">
        <!-- LEFT (40%) -->
        <div class="md:w-[30%] space-y-6">
          <div>
            <ArticleCard
              v-for="article in fashionMuslimArticle"
              :key="article.slug"
              :article="article"
            />
          </div>

          <NuxtLink
            to="/categories/fashion-muslim"
            class="inline-block bg-black text-white text-xs font-bold px-6 py-3 uppercase tracking-widest hover:bg-gray-800 transition"
          >
            Explore All Products
          </NuxtLink>
        </div>

        <!-- RIGHT (60%) -->
        <div class="md:w-[70%] grid grid-cols-2 gap-4">
          <ProductCardList
            v-for="product in fashionMuslimProducts || []"
            :key="product.slug"
            :title="product.title"
            :image="product.image"
            :price="product.price"
            :slug="product.slug"
            :affiliate="product.affiliate"
            :category="product.category"
          />
        </div>
      </div>
    </section>

    <section class="mb-20">
      <!-- WRAPPER -->
      <h2 class="text-xl font-semibold uppercase tracking-widest">
        Your Everyday Confidence
      </h2>
      <div class="flex flex-col md:flex-row gap-10">
        <!-- LEFT (40%) -->
        <div class="md:w-[30%] space-y-6">
          <div>
            <ArticleCard
              v-for="article in braArticle"
              :key="article.slug"
              :article="article"
            />
          </div>

          <NuxtLink
            to="/categories/pakaian-dalam"
            class="inline-block bg-black text-white text-xs font-bold px-6 py-3 uppercase tracking-widest hover:bg-gray-800 transition"
          >
            Explore All Products
          </NuxtLink>
        </div>

        <!-- RIGHT (60%) -->
        <div class="md:w-[70%] grid grid-cols-2 gap-4">
          <ProductCardList
            v-for="product in pakaianDalamProducts"
            :key="product.slug"
            :title="product.title"
            :image="product.image"
            :price="product.price"
            :slug="product.slug"
            :affiliate="product.affiliate"
            :category="product.category"
          />
        </div>
      </div>
    </section>

    <section v-if="reviews?.length">
      <h2 class="text-xl font-semibold uppercase tracking-widest mb-10">
        Latest Reviews
      </h2>

      <div class="grid md:grid-cols-3 gap-6">
        <NuxtLink
          v-for="review in reviews"
          :key="review.path"
          :to="review.path"
          class="border border-gray-100 p-6 hover:shadow-lg transition"
        >
          <h3 class="text-lg font-semibold">
            {{ review.title }}
          </h3>

          <p class="text-sm text-gray-500 mt-2">
            {{ review.description }}
          </p>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
