<script setup>
const route = useRoute();

const { data: article } = await useAsyncData("article", () => queryCollection("articles").where("slug", "=", route.params.slug).first());

const { data: relatedProducts } = await useAsyncData(`related-products-${route.params.slug}`, async () => {
    if (!article.value?.category) {
        return [];
    }

    const products = await queryCollection("products").all();

    return products.filter(product => product.meta?.categories?.includes(article.value.category)).slice(0, 4);
});

useSeoMeta({
    title: article.value?.title,
    description: article.value?.description,

    ogTitle: article.value?.title,
    ogDescription: article.value?.description,
    ogImage: article.value?.image,

    twitterCard: "summary_large_image",
});

useHead({
    link: [
        {
            rel: "canonical",
            href: `https://dotuquonline.com/articles/${route.params.slug}`,
        },
    ],
});
</script>

<template>
    <div class="max-w-3xl mx-auto p-6" v-if="article">
        <img v-if="article.image" :src="article.image" :alt="article.title" class="w-full h-64 object-cover rounded-xl mb-6" />

        <h1 class="text-3xl font-bold mb-2">
            {{ article.title }}
        </h1>

        <p class="text-sm text-gray-500 mb-6">{{ article.date }} • {{ article.author }}</p>

        <div class="prose max-w-none">
            <ContentRenderer :value="article" />
        </div>

        <!-- RELATED PRODUCTS -->
        <section v-if="relatedProducts?.length" class="mt-12 border-t pt-8">
            <h2 class="text-2xl font-semibold mb-6">Produk Terkait</h2>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div v-for="product in relatedProducts" :key="product.slug" class="border rounded-xl overflow-hidden hover:shadow transition">
                    <img :src="product.image" :alt="product.title" class="w-full h-40 object-cover" />

                    <div class="p-3">
                        <h3 class="text-sm font-medium line-clamp-2">
                            {{ product.title }}
                        </h3>

                        <p class="text-primary font-semibold mt-2">
                            {{ product.price }}
                        </p>

                        <a :href="product.affiliate" target="_blank" rel="nofollow sponsored" class="btn btn-primary btn-sm w-full mt-3">Lihat Produk</a>
                    </div>
                </div>
            </div>
        </section>
    </div>

    <div v-else class="p-6 text-center">Article not found</div>
</template>
