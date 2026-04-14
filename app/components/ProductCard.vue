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

const goAffiliate = () => {
  if (props.affiliate) {
    window.open(props.affiliate, "_blank");
  }
};
</script>

<template>
  <NuxtLink
    :to="`/products/${slug}`"
    class="group block bg-white rounded-xl overflow-hidden border hover:shadow-xl transition"
  >
    <div class="relative bg-base-200">
      <img
        :src="image || '/images/placeholder.png'"
        :alt="title || 'product image'"
        class="w-full h-64 object-cover group-hover:scale-105 transition"
      />

      <div
        class="absolute top-3 right-3 bg-yellow-400 text-black rounded-lg px-3 py-2 text-right shadow"
        :class="{ invisible: !discount }"
      >
        <p class="text-xs font-semibold">-{{ discount }}%</p>

        <p
          class="text-sm line-through opacity-60"
          :class="{ invisible: !oldPrice }"
        >
          {{ oldPrice || "-" }}
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

      <!-- ✅ Title clamp -->
      <h3 class="font-semibold leading-snug mt-1 line-clamp-2">
        {{ title }}
      </h3>

      <div class="flex justify-between items-center mt-2">
        <p class="text-price text-base font-semibold">
          {{ price || "-" }}
        </p>

        <p v-if="oldPrice" class="text-sm line-through opacity-60">
          {{ oldPrice }}
        </p>
      </div>

      <!-- ✅ Affiliate button (stop propagation biar gak ikut klik card) -->
      <div class="mt-4">
        <button
          @click.stop="goAffiliate"
          class="btn bg-primary hover:bg-primary-light text-white w-full"
        >
          <PhShoppingCart size="18" />
          Add to Cart
        </button>
      </div>
    </div>
  </NuxtLink>
</template>
