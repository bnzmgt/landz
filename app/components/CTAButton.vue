<script setup>
import { PhShoppingCart } from "@phosphor-icons/vue";

defineProps({
    url: String,
    text: {
        type: String,
        default: "Buy on Shopee",
    },
});
</script>

<template>
    <a :href="url" target="_blank" rel="nofollow sponsored" class="btn btn-warning w-full text-lg font-semibold flex items-center gap-2">
        <PhShoppingCart size="20" weight="fill" />

        {{ text }}
    </a>
</template>
