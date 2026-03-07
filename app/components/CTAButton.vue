<template>
    <a :href="url" target="_blank" rel="nofollow sponsored" class="btn btn-primary">
        {{ text }}
    </a>
</template>

<script setup>
defineProps({
    url: String,
    text: {
        type: String,
        default: "Buy Now",
    },
});
</script>
