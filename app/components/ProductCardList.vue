<script setup>
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
  <NuxtLink :to="`/products/${slug}`" class="group block">
    <div
      class="flex flex-col md:flex-row bg-white border rounded-xl overflow-hidden hover:shadow-xl transition duration-300 hover:-translate-y-1 cursor-pointer"
    >
      <!-- IMAGE -->
      <div class="relative md:w-1/3 bg-gray-100 overflow-hidden">
        <img
          :src="image || '/images/placeholder.png'"
          :alt="title || 'product image'"
          class="w-full aspect-square md:aspect-auto md:h-full object-cover transition duration-300 group-hover:scale-105"
        />

        <!-- DISCOUNT BADGE -->
        <div
          class="absolute top-3 left-3 bg-yellow-400 text-black rounded-lg px-3 py-1.5 text-xs font-semibold shadow"
          :class="{ hidden: !discount }"
        >
          -{{ discount || 0 }}%
        </div>
      </div>

      <!-- CONTENT -->
      <div class="flex-1 p-5 flex flex-col justify-between">
        <!-- TOP -->
        <div class="space-y-1.5">
          <p class="text-[11px] text-gray-400 uppercase tracking-widest">
            {{ category }}
          </p>

          <h3
            class="font-normal text-sm md:text-base leading-snug line-clamp-2 group-hover:text-primary transition"
          >
            {{ title }}
          </h3>
        </div>

        <!-- PRICE -->
        <div class="mt-4 space-y-1">
          <div class="flex items-center gap-2">
            <p class="text-sm font-normal text-gray-900">
              {{ price }}
            </p>

            <p
              class="text-sm line-through text-gray-400"
              :class="{ hidden: !oldPrice }"
            >
              {{ oldPrice || "" }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
