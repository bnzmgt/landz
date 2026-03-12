<script setup>
import { PhShoppingCart } from "@phosphor-icons/vue";

defineProps({
    title: String,
    image: String,
    price: String,
    oldPrice: String,
    category: String,
    slug: String,
    affiliate: String,
    discount: Number,
});
</script>

<template>
    <div class="group bg-base-100 rounded-xl overflow-hidden border hover:shadow-xl transition">
        <div class="relative bg-base-200">
            <img :src="image" :alt="title" class="w-full h-64 object-cover group-hover:scale-105 transition" />

            <div v-if="discount" class="absolute top-3 right-3 bg-yellow-400 text-black rounded-lg px-3 py-2 text-right shadow">
                <p class="text-xs font-semibold">-{{ discount }}%</p>

                <p class="text-xs line-through opacity-70">
                    {{ oldPrice }}
                </p>

                <p class="text-lg font-bold">
                    {{ price }}
                </p>
            </div>
        </div>

        <div class="p-4">
            <p class="text-xs text-gray-400">
                {{ category }}
            </p>

            <h3 class="font-semibold leading-snug mt-1">
                {{ title }}
            </h3>

            <div class="flex justify-between items-center mt-2">
                <p class="text-price text-lg font-bold">
                    {{ price }}
                </p>

                <p v-if="oldPrice" class="text-sm line-through opacity-60">
                    {{ oldPrice }}
                </p>
            </div>

            <div class="mt-4 transition">
                <a :href="affiliate" target="_blank" class="btn bg-primary hover:bg-primary-light text-white w-full">
                    <PhShoppingCart size="18" />
                    Add to Cart
                </a>

                <NuxtLink :to="`/products/${slug}`" class="btn btn-ghost w-full mt-2">Quick View</NuxtLink>
            </div>
        </div>
    </div>
</template>
