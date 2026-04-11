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
    <div class="group flex flex-col md:flex-row bg-white border rounded-xl overflow-hidden hover:shadow-xl transition">
        <!-- IMAGE -->
        <div class="relative md:w-1/3 bg-gray-100">
            <img :src="image" :alt="title" class="w-full h-56 md:h-full object-cover group-hover:scale-105 transition" />

            <!-- DISCOUNT BADGE -->
            <div v-if="discount" class="absolute top-3 left-3 bg-yellow-400 text-black rounded-lg px-3 py-2 text-xs font-semibold shadow">-{{ discount }}%</div>
        </div>

        <!-- CONTENT -->
        <div class="flex-1 p-4 flex flex-col justify-between">
            <!-- TOP -->
            <div>
                <p class="text-xs text-gray-400 uppercase tracking-wide">
                    {{ category }}
                </p>

                <NuxtLink :to="`/products/${slug}`" class="block group">
                    <h3 class="font-semibold text-sm md:text-base leading-snug mt-1 line-clamp-2 group-hover:text-primary transition">
                        {{ title }}
                    </h3>
                </NuxtLink>
            </div>

            <!-- PRICE -->
            <div class="my-3">
                <div class="flex items-center gap-2">
                    <p class="text-sm font-bold text-gray-900">
                        {{ price }}
                    </p>

                    <p v-if="oldPrice" class="text-sm line-through text-gray-400">
                        {{ oldPrice }}
                    </p>
                </div>
            </div>

            <!-- CTA -->
            <div class="space-y-2">
                <a :href="affiliate" target="_blank" class="flex items-center justify-center gap-2 bg-black text-white text-xs font-bold py-3 uppercase tracking-widest hover:bg-gray-800 transition">
                    <PhShoppingCart size="16" />
                    Buy Now
                </a>
            </div>
        </div>
    </div>
</template>
