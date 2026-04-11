<script setup>
const { data: articles } = await useAsyncData("articles", () => queryCollection("articles").all());
</script>

<template>
    <div>{{ articles }}</div>
</template>
