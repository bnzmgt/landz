<template>
    <div v-if="review">
        <h1 class="text-3xl font-bold mb-6">
            {{ review.title }}
        </h1>

        <div class="prose">
            <ContentRenderer :value="review" />
        </div>
    </div>

    <div v-else>Review not found</div>
</template>

<script setup>
const route = useRoute();

const { data: review } = await useAsyncData(`review-${route.params.slug}`, () => queryCollection("reviews").path(`/reviews/${route.params.slug}`).first());
</script>
